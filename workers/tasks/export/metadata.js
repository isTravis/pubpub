import { getPubPublishedDate, getPubUpdatedDate } from 'shared/pub/pubDates';
import dateFormat from 'dateformat';

import ensureUserForAttribution from 'shared/utils/ensureUserForAttribution';
import {
	Branch,
	Collection,
	CollectionPub,
	Community,
	Pub,
	PubAttribution,
	User,
	Release,
} from '../../../server/models';

export const getPubMetadata = async (pubId) => {
	const pubData = await Pub.findOne({
		where: { id: pubId },
		include: [
			{
				model: CollectionPub,
				as: 'collectionPubs',
				include: [
					{
						model: Collection,
						as: 'collection',
					},
				],
			},
			{ model: Community, as: 'community' },
			{ model: Branch, as: 'branches' },
			{
				model: PubAttribution,
				as: 'attributions',
				include: [
					{
						model: User,
						as: 'user',
					},
				],
			},
			{
				model: Release,
				as: 'releases',
			},
		],
	});
	const publishedDate = getPubPublishedDate(pubData);
	const updatedDate = getPubUpdatedDate({ pub: pubData });
	const publishedDateString = publishedDate && dateFormat(publishedDate, 'mmm dd, yyyy');
	const updatedDateString = updatedDate && dateFormat(updatedDate, 'mmm dd, yyyy');
	return {
		title: pubData.title,
		doi: pubData.doi,
		licenseSlug: pubData.licenseSlug,
		publishedDateString: publishedDateString,
		updatedDateString: updatedDateString,
		communityTitle: pubData.community.title,
		accentColor: pubData.community.accentColorDark,
		primaryCollectionTitle: [pubData.collectionPubs.find((cp) => cp.isPrimary)]
			.filter((x) => x)
			.map((cp) => cp.collection.title)
			.pop(),
		primaryCollectionMetadata: [pubData.collectionPubs.find((cp) => cp.isPrimary)]
			.filter((x) => x)
			.map((cp) => cp.collection.metadata)
			.pop(),
		attributions: pubData.attributions
			.concat()
			.sort((a, b) => a.order - b.order)
			.filter((attr) => attr.isAuthor)
			.map((attr) => ensureUserForAttribution(attr)),
		citationStyle: pubData.citationStyle,
		citationInlineStyle: pubData.citationInlineStyle,
	};
};
