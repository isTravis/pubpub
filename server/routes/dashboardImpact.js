import React from 'react';

import Html from 'server/Html';
import app from 'server/server';
import { handleErrors } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { hostIsValid } from 'server/utils/routes';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
// import { getImpact } from 'server/utils/queryHelpers';

app.get(
	['/dash/impact', '/dash/collection/:collectionSlug/impact', '/dash/pub/:pubSlug/impact'],
	async (req, res, next) => {
		try {
			if (!hostIsValid(req, 'community')) {
				return next();
			}
			const initialData = await getInitialData(req, true);
			// const impactData = await getImpact(initialData);
			const impactData = {};
			return renderToNodeStream(
				res,
				<Html
					chunkName="DashboardImpact"
					initialData={initialData}
					viewData={{ impactData: impactData }}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: `Impact · ${initialData.scopeData.elements.activeTarget.title}`,
						unlisted: true,
					})}
				/>,
			);
		} catch (err) {
			return handleErrors(req, res, next)(err);
		}
	},
);
