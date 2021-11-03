import app, { wrap } from 'server/server';
import { ForbiddenError } from 'server/utils/errors';

import { getPermissions } from './permissions';
import {
	createSubmissionWorkflow,
	updateSubmissionWorkflow,
	destroySubmissionWorkFlow,
} from './queries';

const getRequestIds = (req) => {
	const user = req.user || {};
	return {
		userId: user.id,
		communityId: req.body.communityId,
		collectionId: req.body.id || null,
	};
};

app.post(
	'/api/submissionWorkflows',
	wrap(async (req, res) => {
		const requestIds = getRequestIds(req);
		const permissions = await getPermissions(requestIds);
		if (!permissions.create) {
			throw new ForbiddenError();
		}
		const newCollection = await createSubmissionWorkflow(req.body, req.user.id);
		return res.status(201).json(newCollection);
	}),
);

app.put(
	'/api/submissionWorkflows',
	wrap(async (req, res) => {
		const permissions = await getPermissions(getRequestIds(req));
		if (!permissions.update) {
			throw new ForbiddenError();
		}
		const updatedValues = await updateSubmissionWorkflow(
			{
				...req.body,
				collectionId: req.body.id,
			},
			permissions.update,
			req.user.id,
		);
		return res.status(200).json(updatedValues);
	}),
);

app.delete(
	'/api/submissionWorkflows',
	wrap(async (req, res) => {
		const permissions = await getPermissions(getRequestIds(req));
		if (!permissions.update) {
			throw new ForbiddenError();
		}
		await destroySubmissionWorkFlow(
			{
				...req.body,
				collectionId: req.body.id,
			},
			req.user.id,
		);
		return res.status(200).json(req.body.id);
	}),
);
