import { purgeSurrogateTag } from './purgeSurrogateTag';

/**
 * Creates a cache purge debouncer function.
 *
 * @param errorHandler - The error handler function to handle any errors that occur during the purge process. Defaults to console.error.
 * @param debounceTime - The debounce time in milliseconds. Defaults to 1000ms.
 * @param throttleTime - The throttle time in milliseconds. Defaults to 250ms.
 * @returns A function that can be used to schedule cache purges.
 */
export const createCachePurgeDebouncer = (
	{
		errorHandler = (error) => console.error(error),
		debounceTime = 1000,
		throttleTime = 250,
	}: {
		errorHandler?: (error: any) => any;
		debounceTime?: number;
		throttleTime?: number;
	} = {
		errorHandler: (error) => console.error(error),
		debounceTime: 1000,
		throttleTime: 250,
	},
) => {
	// eslint-disable-next-line no-undef
	const purgeRequests = new Map<string, { timer: NodeJS.Timeout; resolver: () => void }>();
	let lastExecutionTime = 0;

	const resolvePromiseForKey = (key: string) => {
		const request = purgeRequests.get(key);
		if (request) {
			request.resolver();
			purgeRequests.delete(key);
		}
	};

	const executePurge = (key: string) => {
		const now = Date.now();
		if (now - lastExecutionTime > throttleTime) {
			lastExecutionTime = now;

			purgeSurrogateTag(key)
				.then(() => resolvePromiseForKey(key))
				.catch(errorHandler);
		} else {
			setTimeout(() => executePurge(key), throttleTime - (now - lastExecutionTime));
		}
	};

	const schedulePurge = (key: string): Promise<void> => {
		return new Promise((resolve) => {
			const existingRequest = purgeRequests.get(key);
			if (existingRequest) {
				clearTimeout(existingRequest.timer);
				resolvePromiseForKey(key);
			}
			purgeRequests.set(key, {
				timer: setTimeout(() => {
					executePurge(key);
				}, debounceTime),
				resolver: resolve,
			});
		});
	};
	return schedulePurge;
};

/**
 * Schedule a purge for a surrogate tag from Fastly
 *
 * @param tag The tag to purge, this should be the domain
 * @param soft Whether to do a soft purge. This marks the content as stale and will serve stale content while the new content is being fetched
 */
export const schedulePurge = createCachePurgeDebouncer();
