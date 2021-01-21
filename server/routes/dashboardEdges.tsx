import React from 'react';

import app, { wrap } from 'server/server';
import Html from 'server/Html';
import { handleErrors, ForbiddenError } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { hostIsValid } from 'server/utils/routes';

import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
import { getOverview, sanitizeOverview, getPubForRequest } from 'server/utils/queryHelpers';

const getOverviewForEdges = async (initialData) => {
	const rawOverview = await getOverview({
		...initialData.scopeData.elements,
		activeTargetType: 'community',
	});
	const { pubs } = sanitizeOverview(initialData, rawOverview);
	return { pubs: pubs };
};

app.get(
	'/dash/pub/:pubSlug/connections',
	wrap(async (req, res, next) => {
		try {
			if (!hostIsValid(req, 'community')) {
				return next();
			}
			const { pubSlug } = req.params;
			const initialData = await getInitialData(req, true);
			const [overviewData, pubData] = await Promise.all([
				getOverviewForEdges(initialData),
				getPubForRequest({
					slug: pubSlug,
					initialData: initialData,
					getEdges: 'all',
				}),
			]);

			if (!pubData) {
				throw new ForbiddenError();
			}

			return renderToNodeStream(
				res,
				<Html
					chunkName="DashboardEdges"
					initialData={initialData}
					viewData={{ overviewData: overviewData, pubData: pubData }}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: `Connections · ${pubData.title}`,
						unlisted: true,
					})}
				/>,
			);
		} catch (err) {
			return handleErrors(req, res, next)(err);
		}
	}),
);
