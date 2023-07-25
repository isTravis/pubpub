import { Collection, CollectionAttribution, includeUserModel } from 'server/models';

import { stripFalsyIdsFromQuery } from './util';

export const getCollection = async ({
	communityId,
	collectionId = null,
	collectionSlug = null,
}: {
	communityId?: string | null;
	collectionId?: string | null;
	collectionSlug?: string | null;
}) => {
	return Collection.findOne({
		where: stripFalsyIdsFromQuery({
			id: collectionId,
			slug: collectionSlug,
			communityId,
		}),
		include: [
			{
				model: CollectionAttribution,
				as: 'attributions',
				include: [includeUserModel({ as: 'user' })],
			},
		],
	});
};
