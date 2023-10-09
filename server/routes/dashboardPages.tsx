import React from 'react';

import Html from 'server/Html';
import app from 'server/server';
import { NotFoundError, handleErrors } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { hostIsValid } from 'server/utils/routes';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
// import { getPages } from 'server/utils/queryHelpers';

app.get(['/dash/pages'], async (req, res, next) => {
	try {
		if (!hostIsValid(req, 'community')) {
			return next();
		}
		const initialData = await getInitialData(req, { isDashboard: true });

		const { activeTarget } = initialData.scopeData.elements;

		if (!activeTarget) {
			throw new NotFoundError();
		}
		// const pagesData = await getPages(initialData);
		return renderToNodeStream(
			res,
			<Html
				chunkName="DashboardPages"
				initialData={initialData}
				viewData={{}}
				headerComponents={generateMetaComponents({
					initialData,
					title: `Pages · ${activeTarget.title}`,
					unlisted: true,
				})}
			/>,
		);
	} catch (err) {
		return handleErrors(req, res, next)(err);
	}
});
