/* eslint-disable import/prefer-default-export */
import Cite from 'citation-js';

import * as types from 'types';
import getCollectionDoi from 'utils/collections/getCollectionDoi';
import { getPubPublishedDate } from 'utils/pub/pubDates';
import { pubUrl } from 'utils/canonicalUrls';
import { getPrimaryCollection } from 'utils/collections/primary';
import { renderJournalCitationForCitations } from 'utils/citations';
import { getAllPubContributors, getAllPubContributorsRoles } from 'utils/contributors';

const getDatePartsObject = (date) => ({
	'date-parts': [date.getFullYear(), date.getMonth() + 1, date.getDate()],
});

const collectionKindToCitationJSPart = (kind) =>
	({
		book: 'chapter',
		conference: 'paper-conference',
		issue: 'article-journal',
	}[kind] || 'article-journal');

const getCollectionLevelData = (collection) => {
	if (!collection) {
		return { type: 'article-journal' };
	}
	const { kind, title } = collection;
	const metadata = collection.metadata || {};
	const useCollectionTitle = collection.kind !== 'issue';
	return {
		type: collectionKindToCitationJSPart(kind),
		...(useCollectionTitle && { 'container-title': title }),
		containerDoi: getCollectionDoi(collection),
		ISBN: metadata.isbn,
		ISSN: metadata.issn || metadata.printIssn || metadata.electronicIssn,
		edition: metadata.edition,
		volume: metadata.volume,
		issue: metadata.issue,
	};
};

export const generateCitationHtml = async (
	pubData: types.SanitizedPubData,
	communityData: types.Community,
) => {
	// TODO: We need to set the updated times properly, which are likely stored in firebase.
	const pubIssuedDate = getPubPublishedDate(pubData);
	const pubLink = pubUrl(communityData, pubData);
	const primaryCollection = getPrimaryCollection(pubData.collectionPubs);
	const authors = getAllPubContributors(pubData).map((attribution) => {
		if (
			(types.isCollectionAttribution(attribution) || types.isPubAttribution(attribution)) &&
			attribution.isAuthor
		) {
			return {
				given: attribution.user.firstName,
				family: attribution.user.lastName,
			};
		}
		return {};
	});
	const authorEntry = authors.length ? { author: authors } : {};

	const editors = getAllPubContributorsRoles(pubData, 'editor').map((attribution) => {
		if (
			(types.isCollectionAttribution(attribution) || types.isPubAttribution(attribution)) &&
			attribution.isAuthor
		) {
			return {
				given: attribution.user.firstName,
				family: attribution.user.lastName,
			};
		}
		return {};
	});
	const editorEntry = editors.length ? { editor: editors } : {};

	const illustrators = getAllPubContributorsRoles(pubData, 'illustrator').map((attribution) => {
		if (
			(types.isCollectionAttribution(attribution) || types.isPubAttribution(attribution)) &&
			attribution.isAuthor
		) {
			return {
				given: attribution.user.firstName,
				family: attribution.user.lastName,
			};
		}
		return {};
	});
	const illustratorEntry = illustrators.length ? { illustrator: illustrators } : {};

	const translators = getAllPubContributorsRoles(pubData, 'Translator').map((attribution) => {
		if (
			(types.isCollectionAttribution(attribution) || types.isPubAttribution(attribution)) &&
			attribution.isAuthor
		) {
			return {
				given: attribution.user.firstName,
				family: attribution.user.lastName,
			};
		}
		return {};
	});
	const translatorEntry = translators.length ? { translator: translators } : {};

	const collectionEditors = getAllPubContributorsRoles(pubData, 'Series Editor').map(
		(attribution) => {
			if (
				(types.isCollectionAttribution(attribution) ||
					types.isPubAttribution(attribution)) &&
				attribution.isAuthor
			) {
				return {
					given: attribution.user.firstName,
					family: attribution.user.lastName,
				};
			}
			return {};
		},
	);
	const collectionEditorEntry = {
		'collection-editor': [{ given: 'Testname', family: 'Testfamilyname' }],
	};

	const chairs = getAllPubContributorsRoles(pubData, 'Chair').map((attribution) => {
		if (
			(types.isCollectionAttribution(attribution) || types.isPubAttribution(attribution)) &&
			attribution.isAuthor
		) {
			return {
				given: attribution.user.firstName,
				family: attribution.user.lastName,
			};
		}
		return {};
	});
	const chairEntry = { chair: [{ given: 'James', family: 'Pearson' }] };

	console.log(collectionEditors, chairs);
	// for role[0] provide a atrribution appropriate to the CSL-JSON output
	const commonData = {
		// @ts-expect-error ts-migrate(2783) FIXME: 'type' is specified more than once, so this usage ... Remove this comment to see the full error message
		type: 'article-journal',
		title: pubData.title,
		...authorEntry,
		...editorEntry,
		...illustratorEntry,
		...collectionEditorEntry,
		...chairEntry,
		...translatorEntry,
		...renderJournalCitationForCitations(
			primaryCollection?.kind,
			communityData.citeAs,
			communityData.title,
		),
		...getCollectionLevelData(primaryCollection),
		publisher: communityData.publishAs || '',
	};
	const pubCiteObject = await Cite.async({
		...commonData,
		// @ts-expect-error ts-migrate(2339) FIXME: Property 'containerDoi' does not exist on type '{ ... Remove this comment to see the full error message
		DOI: pubData.doi || commonData.containerDoi,
		ISSN: pubData.doi ? communityData.issn : null,
		issued: pubIssuedDate && [getDatePartsObject(pubIssuedDate)],
		note: pubLink,
		URL: pubLink,
	});
	return {
		pub: {
			default: pubCiteObject
				.get({
					format: 'string',
					type: 'html',
					style: `citation-${pubData.citationStyle}`,
					lang: 'en-US',
				})
				.replace(/\n/gi, ''),
			apa: pubCiteObject
				.get({ format: 'string', type: 'html', style: 'citation-apa', lang: 'en-US' })
				.replace(/\n/gi, ''),
			harvard: pubCiteObject
				.get({ format: 'string', type: 'html', style: 'citation-harvard', lang: 'en-US' })
				.replace(/\n/gi, ''),
			vancouver: pubCiteObject
				.get({ format: 'string', type: 'html', style: 'citation-vancouver', lang: 'en-US' })
				.replace(/\n/gi, ''),
			bibtex: pubCiteObject.get({
				format: 'string',
				type: 'html',
				style: 'bibtex',
				lang: 'en-US',
			}),
		},
	};
};
