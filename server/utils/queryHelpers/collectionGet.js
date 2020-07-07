import { Collection, CollectionAttribution, User } from 'server/models';

import { stripFalsyIdsFromQuery } from './util';

export const getCollection = async ({
	communityId,
	collectionId = null,
	collectionSlug = null,
}) => {
	return Collection.findOne({
		where: stripFalsyIdsFromQuery({
			id: collectionId,
			slug: collectionSlug,
			communityId: communityId,
		}),
		include: [
			{
				model: CollectionAttribution,
				as: 'attributions',
				include: [{ model: User, as: 'user' }],
			},
		],
	});
};
