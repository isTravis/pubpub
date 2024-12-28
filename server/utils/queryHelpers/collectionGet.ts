import { Collection, CollectionAttribution, Community, includeUserModel } from 'server/models';

import { stripFalsyIdsFromQuery } from './util';

export const getCollection = async ({
	communityId,
	collectionId = null,
	collectionSlug = null,
	includeCommunity = false,
}: {
	communityId?: string | null;
	collectionId?: string | null;
	collectionSlug?: string | null;
	includeCommunity?: boolean;
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
			...(includeCommunity
				? [
						{
							model: Community,
							as: 'community',
						},
				  ]
				: []),
		],
	});
};
