import { Request, Response, NextFunction } from 'express';
import { defer } from 'server/utils/deferred';
import { isDuqDuq, isProd } from 'utils/environment';
import { createCachePurgeDebouncer } from './schedulePurge';

const ALLOWED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'] as const;
type AllowedMethods = (typeof ALLOWED_METHODS)[number];

/**
 * There are some routes that look like they change data, but they don't.
 */
const nonPurgeNonGetRoutes = {
	'/api/pubs/many': ['POST'],
	'/api/upload': ['POST'],
	'/api/pubs/text/convert': ['POST'],
	'/api/login': ['POST'],
	'/api/logout': ['POST'],
	'/api/register': ['POST'],
	'/api/signup': ['POST'],
	'/api/subscribe': ['POST'],
	'/api/activityItems': ['POST'],
	/**
	 * Exports get purged in the export task
	 */
	'/api/export': ['POST'],
} satisfies {
	[Path in `/api/${string}`]: AllowedMethods[];
};

/**
 * These are routes with path parameters that we don't want to purge
 * They aren't easily caught in the map above
 */
const otherNonPurgeRoutes = /\/api\/(pubs|collections)\/[^/]+\/doi\/preview/;

/**
 * Purge domain cache on CRUD operations
 *
 * WARNING: Do not return anything from this middleware!
 * It runs after the response has been sent, so returning anything will cause an error
 */
export const purgeMiddleware = (errorHandler = (error: any): any => console.error(error)) => {
	const schedulePurge = createCachePurgeDebouncer({ errorHandler });

	return async (req: Request, res: Response, next: NextFunction) => {
		/**
		 * We don't want to purge GET/CORS/HEAD etc requests, that's the whole point!
		 */
		if (!ALLOWED_METHODS.includes(req.method as AllowedMethods)) {
			return next();
		}

		/**
		 * Very strong fail safe, but don't purge cache on non-API requests
		 */
		if (!req.path.startsWith('/api')) {
			return next();
		}

		const shouldNotPurgeMethodsForPath = nonPurgeNonGetRoutes[req.path];

		if (shouldNotPurgeMethodsForPath && shouldNotPurgeMethodsForPath.includes(req.method)) {
			return next();
		}

		if (otherNonPurgeRoutes.test(req.path)) {
			return next();
		}

		/**
		 * On Fastly, we set the surrogate tag to the hostname
		 */
		const surrogateTag = req.hostname;

		if (!surrogateTag) {
			return next();
		}

		/**
		 * When the request finishes, schedule a purge
		 */
		res.on('finish', () => {
			/**
			 * We only now know the status code, so check if the request was actually successful
			 */
			if (res.statusCode >= 400) {
				return;
			}

			defer(async () => {
				/**
				 * this await is here so you can wait on the purge requests
				 * using `finishDeferredTasks` in tests or other short lived processes
				 */
				await schedulePurge(surrogateTag);
			});
		});

		return next();
	};
};
