import app, { wrap } from 'server/server';
import { ForbiddenError } from 'server/utils/errors';

import { getPermissions } from './permissions';
import { createMember, updateMember, destroyMember } from './queries';

const getRequestIds = (req) => {
	const user = req.user || {};
	const { pubId, collectionId, communityId } = req.body;
	return {
		pubId: pubId,
		collectionId: collectionId,
		communityId: communityId,
		actorId: user.id,
	};
};

const chooseTargetFromRequestIds = ({ pubId, collectionId, communityId }) => {
	if (pubId) {
		return { pubId: pubId };
	}
	if (collectionId) {
		return { collectionId: collectionId };
	}
	if (communityId) {
		return { communityId: communityId };
	}
	return {};
};

app.post(
	'/api/members',
	wrap(async (req, res) => {
		const { pubId, collectionId, communityId, actorId } = getRequestIds(req);
		const { targetUserId, value } = req.body;
		// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ actorId: any; pubId: any; comm... Remove this comment to see the full error message
		const permissions = await getPermissions({
			actorId: actorId,
			pubId: pubId,
			communityId: communityId,
			collectionId: collectionId,
			value: value,
		});
		if (!permissions.create) {
			// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
			throw new ForbiddenError();
		}
		const member = await createMember({
			value: value,
			// @ts-expect-error ts-migrate(2322) FIXME: Type '{ pubId: any; collectionId?: undefined; comm... Remove this comment to see the full error message
			target: {
				userId: targetUserId,
				...chooseTargetFromRequestIds({
					pubId: pubId,
					collectionId: collectionId,
					communityId: communityId,
				}),
			},
		});
		return res.status(201).json(member);
	}),
);

app.put(
	'/api/members',
	wrap(async (req, res) => {
		const { pubId, collectionId, communityId, actorId } = getRequestIds(req);
		const { value, id } = req.body;
		const permissions = await getPermissions({
			actorId: actorId,
			pubId: pubId,
			communityId: communityId,
			collectionId: collectionId,
			memberId: id,
			value: value,
		});
		if (!permissions.update) {
			// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
			throw new ForbiddenError();
		}
		const member = await updateMember({
			value: value,
			memberId: id,
		});
		return res.status(200).json(member);
	}),
);

app.delete(
	'/api/members',
	wrap(async (req, res) => {
		const { pubId, collectionId, communityId, actorId } = getRequestIds(req);
		const { value, id } = req.body;
		const permissions = await getPermissions({
			actorId: actorId,
			pubId: pubId,
			communityId: communityId,
			collectionId: collectionId,
			memberId: id,
			value: value,
		});
		if (!permissions.destroy) {
			// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
			throw new ForbiddenError();
		}
		await destroyMember({ memberId: id });
		return res.status(200).json(id);
	}),
);
