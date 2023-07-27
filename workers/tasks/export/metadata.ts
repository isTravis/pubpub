import dateFormat from 'dateformat';

import * as types from 'types';
import { getPubPublishedDate, getPubUpdatedDate } from 'utils/pub/pubDates';
import { getPrimaryCollection } from 'utils/collections/primary';
import { renderJournalCitation } from 'utils/citations';
import { getUrlForPub } from 'utils/pubEdge';
import {
	Collection,
	CollectionPub,
	Community,
	Pub,
	PubAttribution,
	Release,
	CollectionAttribution,
	includeUserModel,
} from 'server/models';

import { renderLicenseForPub } from 'utils/licenses';
import { getAllPubContributors } from 'utils/contributors';
import { fetchFacetsForScope } from 'server/facets';

import { expect } from 'utils/assert';
import { PubMetadata } from './types';

const getPrimaryCollectionMetadata = (collectionPubs: types.CollectionPub[]) => {
	const primaryCollection = getPrimaryCollection(collectionPubs);
	if (primaryCollection) {
		const { metadata, title, kind } = primaryCollection;
		return {
			primaryCollectionMetadata: metadata,
			primaryCollectionTitle: title,
			primaryCollectionKind: kind,
		};
	}
	return null;
};

export const getPubMetadata = async (pubId: string): Promise<PubMetadata> => {
	const pubData = expect(
		await Pub.findOne({
			where: { id: pubId },
			include: [
				{
					model: CollectionPub,
					as: 'collectionPubs',
					include: [
						{
							model: Collection,
							as: 'collection',
							include: [
								{
									model: CollectionAttribution,
									as: 'attributions',
									include: [includeUserModel({ as: 'user' })],
								},
							],
						},
					],
				},
				{ model: Community, as: 'community' },
				{
					model: PubAttribution,
					as: 'attributions',
					include: [includeUserModel({ as: 'user' })],
				},
				{
					model: Release,
					as: 'releases',
				},
			],
		}),
	) as types.DefinitelyHas<Pub, 'community' | 'attributions' | 'releases'> & {
		collectionPubs: types.DefinitelyHas<CollectionPub, 'collection'>[];
	};
	const facets = await fetchFacetsForScope({ pubId });
	const pubUrl = getUrlForPub(pubData, pubData.community);
	const publishedDate = getPubPublishedDate(pubData);
	const license = renderLicenseForPub({
		pub: pubData,
		community: pubData.community,
		collectionPubs: pubData.collectionPubs,
		license: facets.License.value,
	});
	const updatedDate = getPubUpdatedDate({ pub: pubData });
	const publishedDateString = publishedDate && dateFormat(publishedDate, 'mmm dd, yyyy');
	const updatedDateString = updatedDate && dateFormat(updatedDate, 'mmm dd, yyyy');
	const primaryCollection = getPrimaryCollection(pubData.collectionPubs);
	const attributions = getAllPubContributors(pubData, 'contributors', false, true);

	return {
		title: pubData.title,
		slug: pubData.slug,
		pubUrl,
		doi: pubData.doi,
		publishedDateString,
		updatedDateString,
		communityTitle: renderJournalCitation(
			primaryCollection?.kind,
			pubData.community.citeAs,
			pubData.community.title,
		),
		accentColor: expect(pubData.community.accentColorDark),
		attributions,
		// @ts-expect-error: FIXME: Citationstyle is not in the model, its in the facets
		citationStyle: pubData.citationStyle,
		// @ts-expect-error: FIXME: CitationInlineStyle is not in the model, its in the facets
		citationInlineStyle: pubData.citationInlineStyle,
		nodeLabels: facets.NodeLabels.value,
		publisher: pubData.community.publishAs,
		...getPrimaryCollectionMetadata(pubData.collectionPubs),
		license,
	};
};
