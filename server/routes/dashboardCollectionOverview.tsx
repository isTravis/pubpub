import React from 'react';
import queryString from 'query-string';

import Html from 'server/Html';
import app from 'server/server';
import { handleErrors, ForbiddenError } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { hostIsValid } from 'server/utils/routes';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
import { getCollectionOverview } from 'server/utils/queryHelpers';
import { createUserScopeVisit } from 'server/userScopeVisit/queries';
import { SubmissionWorkflow } from 'server/models';

const getSubmissionWorkflow = async (collectionId: string): Promise<Number> => {
	const workflow: Number = await SubmissionWorkflow.count({ where: { collectionId } });
	return workflow;
};

app.get('/dash/collection/:collectionSlug', (req, res) => {
	const { collectionSlug } = req.params;
	res.redirect(
		queryString.stringifyUrl({
			url: `/dash/collection/${collectionSlug}/overview`,
			query: req.query,
		}),
	);
});

app.get('/dash/collection/:collectionSlug/overview', async (req, res, next) => {
	try {
		if (!hostIsValid(req, 'community')) {
			next();
		}
		const initialData = await getInitialData(req, true);
		const {
			scopeData: {
				activePermissions: { canView },
				elements,
			},
		} = initialData;

		if (!canView && !elements.activeCollection!.isPublic) {
			throw new ForbiddenError();
		}

		const overviewData = await getCollectionOverview(initialData);
		const submissionWorkflowPresent = await Promise.all([
			getSubmissionWorkflow(overviewData.collection.id),
		]);

		const submissionWorkflows = submissionWorkflowPresent[0];
		const {
			communityData: { id: communityId },
			loginData: { id: userId },
		} = initialData;
		const {
			collection: { id: collectionId, title },
		} = overviewData;

		createUserScopeVisit({ userId, communityId, collectionId });

		return renderToNodeStream(
			res,
			<Html
				chunkName="DashboardCollectionOverview"
				initialData={initialData}
				viewData={{ overviewData, submissionWorkflows }}
				headerComponents={generateMetaComponents({
					initialData,
					title: `Overview · ${title}`,
					unlisted: true,
				})}
			/>,
		);
	} catch (err) {
		return handleErrors(req, res, next)(err);
	}
});
