import React from 'react';
import Promise from 'bluebird';
import Html from '../Html';
import app from '../server';
import {
	hostIsValid,
	renderToNodeStream,
	getInitialData,
	handleErrors,
	generateMetaComponents,
} from '../utils';
import { getOverview, sanitizeOverview } from '../utils/queryHelpers';

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
				return Promise.all([initialData, getOverview(initialData)]);
			})
			.then(async ([initialData, overviewData]) => {
				console.time('overviewSanitize');
				const sanitizedOverviewData = await sanitizeOverview(initialData, overviewData);
				console.timeEnd('overviewSanitize');
				return renderToNodeStream(
					res,
					<Html
						chunkName="DashboardOverview"
						initialData={initialData}
						viewData={{ overviewData: sanitizedOverviewData }}
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
