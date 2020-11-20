import React from 'react';
import Promise from 'bluebird';

import Html from 'server/Html';
import app from 'server/server';
import { handleErrors } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { hostIsValid } from 'server/utils/routes';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
import { getOverview, sanitizeOverview } from 'server/utils/queryHelpers';

app.get(
	[
		'/dash',
		'/dash/overview',
		'/dash/collection/:collectionSlug',
		'/dash/collection/:collectionSlug/overview',
	],
	(req, res, next) => {
		if (!hostIsValid(req, 'community')) {
			return next();
		}
		if (!req.path.endsWith('overview')) {
			const splitUrl = req.originalUrl.split('?');
			const queryString = splitUrl.length > 1 ? `?${splitUrl[1]}` : '';
			return res.redirect(`${req.path}/overview${queryString}`);
		}

		return getInitialData(req, true)
			.then((initialData) => {
				// @ts-expect-error ts-migrate(2339) FIXME: Property 'elements' does not exist on type '{ elem... Remove this comment to see the full error message
				return Promise.all([initialData, getOverview(initialData.scopeData.elements)]);
			})
			.then(([initialData, overviewData]) => {
				const sanitizedOverviewData = sanitizeOverview(initialData, overviewData);

				return renderToNodeStream(
					res,
					<Html
						chunkName="DashboardOverview"
						initialData={initialData}
						viewData={{ overviewData: sanitizedOverviewData }}
						// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ initialData: any; title: strin... Remove this comment to see the full error message
						headerComponents={generateMetaComponents({
							initialData: initialData,
							title: `Overview · ${initialData.scopeData.elements.activeTarget.title}`,
							unlisted: true,
						})}
					/>,
				);
			})
			.catch(handleErrors(req, res, next));
	},
);
