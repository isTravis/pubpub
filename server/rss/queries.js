import RSS from 'rss';
import dateFormat from 'dateformat';
import { Op, QueryTypes } from 'sequelize';

import { communityUrl as getCommunityUrl, pubUrl } from 'utils/canonicalUrls';
import { getPubPublishedDate } from 'utils/pub/pubDates';
import { getAllPubContributors, getContributorName } from 'utils/pub/contributors';
import { getFormattedDownloadUrl, getPublicExportUrl } from 'utils/pub/downloads';

import {
	Branch,
	Collection,
	CollectionAttribution,
	CollectionPub,
	Export,
	includeUserModel,
	Pub,
	PubAttribution,
	PubEdge,
	Release,
	sequelize,
} from 'server/models';

const pubsIdsQuery = `
	WITH query_values (required_slugs, forbidden_slugs, published_before, published_after) AS (
		VALUES (
			Array[:requiredCollectionSlugs]::text[],
			Array[:forbiddenCollectionSlugs]::text[],
			:publishedBefore::timestamp,
			:publishedAfter::timestamp
		)
	)
	SELECT "pubId" FROM (
		SELECT 
			"pub"."id" as "pubId",
			"pub"."slug",
			"pub"."title",
			array_agg(distinct "collection"."slug") AS slugs,
			count("inboundEdge") + count("outboundEdge") as parents,
			coalesce("pub"."customPublishedAt", min("release"."createdAt")) as publication_date
		FROM "Pubs" AS "pub"
			-- Grab connection information
			LEFT OUTER JOIN "PubEdges" AS "inboundEdge" ON (
				"inboundEdge"."targetPubId" = "pub"."id" AND
				"inboundEdge"."pubIsParent" = true AND
				"inboundEdge"."approvedByTarget" = true
			)
			LEFT OUTER JOIN "PubEdges" AS "outboundEdge" ON (
				"outboundEdge"."pubId" = "pub"."id" AND 
				"outboundEdge"."pubIsParent" = false
			)
			-- Grab collection information to compare slugs
			LEFT OUTER JOIN "CollectionPubs" AS "collectionPub" ON "pub"."id" = "collectionPub"."pubId"
			LEFT OUTER JOIN "Collections" AS "collection" ON (
				"collectionPub"."collectionId" = "collection"."id" AND
				"collection"."isPublic" = true
			)
			-- We only want Pubs within a given community
			LEFT OUTER JOIN "Communities" AS "community" ON "pub"."communityId" = "community"."id"
			-- We need an associated Release
			INNER JOIN "Releases" AS "release" ON "pub"."id" = "release"."pubId"
		WHERE "community"."id" = :communityId
		GROUP BY "pub"."id"
	) AS results, query_values
	-- Check that there is overlap between the slugs and the required slugs
	WHERE (required_slugs = Array[]::text[] OR results.slugs && required_slugs)
	-- Check that there is no overlap between the slugs and the forbidden slugs
	AND NOT results.slugs && forbidden_slugs
	-- Check that the Pub is not a child, if that matters
	AND (:allowChildren OR results.parents = 0)
	-- Check that the Pub meets any provided date constraints
	AND (published_before IS NULL OR results.publication_date < published_before)
	AND (published_after IS NULL OR results.publication_date >= published_after)
	ORDER BY results.publication_date DESC
	LIMIT :limit
`;

const normalizeDate = (datelike) => dateFormat(new Date(datelike), 'yyyy-mm-dd');

const parseDateFilters = ({ publishedOn, publishedAfter, publishedBefore }) => {
	if (publishedOn) {
		const startTime = new Date(publishedOn).valueOf();
		return {
			publishedAfter: normalizeDate(startTime),
			publishedBefore: normalizeDate(startTime + 86400 * 1000),
		};
	}
	return {
		...(publishedAfter && { publishedAfter: normalizeDate(publishedAfter) }),
		...(publishedBefore && { publishedBefore: normalizeDate(publishedBefore) }),
	};
};

const parseCollectionConnectionFilters = ({ collections, connections }) => {
	const requiredCollectionSlugs = [];
	const forbiddenCollectionSlugs = [];
	(collections || '').split(',').forEach((slug) => {
		if (slug.startsWith('-')) {
			forbiddenCollectionSlugs.push(slug.slice(1));
		} else if (slug) {
			requiredCollectionSlugs.push(slug);
		}
	});
	const forbidChildren = connections === '0' || connections === 'false' || connections === false;
	return {
		allowChildren: !forbidChildren,
		requiredCollectionSlugs: requiredCollectionSlugs,
		forbiddenCollectionSlugs: forbiddenCollectionSlugs,
	};
};

export const getQueriedPubIds = async ({ communityId, limit, query }) => {
	const { publishedBefore = null, publishedAfter = null } = parseDateFilters(query);
	const {
		requiredCollectionSlugs = [],
		forbiddenCollectionSlugs = [],
		allowChildren = true,
	} = parseCollectionConnectionFilters(query);
	const rows = await sequelize.query(pubsIdsQuery, {
		type: QueryTypes.SELECT,
		replacements: {
			publishedBefore: publishedBefore,
			publishedAfter: publishedAfter,
			allowChildren: allowChildren,
			requiredCollectionSlugs: requiredCollectionSlugs,
			forbiddenCollectionSlugs: forbiddenCollectionSlugs,
			communityId: communityId,
			limit: limit,
		},
	});
	return rows.map((row) => row.pubId);
};

export const getPubData = async (pubIds) => {
	const pubs = await Pub.findAll({
		where: {
			id: {
				[Op.in]: pubIds,
			},
		},
		include: [
			{
				model: PubAttribution,
				as: 'attributions',
				include: [includeUserModel({ as: 'user' })],
			},
			{
				model: Release,
				as: 'releases',
			},
			{
				model: Branch,
				as: 'branches',
				include: [
					{
						model: Export,
						as: 'exports',
					},
				],
			},
			{
				model: PubEdge,
				as: 'inboundEdges',
			},
			{
				model: PubEdge,
				as: 'outboundEdges',
			},
			{
				model: CollectionPub,
				as: 'collectionPubs',
				include: [
					{
						required: true,
						where: {
							isPublic: true,
						},
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
		],
	});
	// pubIds are already in publication-date order, so sort results based on that.
	return pubs.sort((a, b) => pubIds.indexOf(a.id) - pubIds.indexOf(b.id));
};

const createEnclosure = (url) => {
	return {
		enclosure: {
			_attr: {
				url: url,
			},
		},
	};
};

export const getFeedItemForPub = (pubData, communityData) => {
	const { title, description, collectionPubs, id } = pubData;
	const formattedDownload = getFormattedDownloadUrl(pubData);
	const pdfExport = getPublicExportUrl(pubData, 'pdf');
	const xmlExport = getPublicExportUrl(pubData, 'jats');
	const bestPdf = formattedDownload || pdfExport;
	return {
		title: title,
		description: description,
		url: pubUrl(communityData, pubData),
		guid: id,
		date: getPubPublishedDate(pubData),
		categories: collectionPubs
			.sort((a, b) => +b.isPrimary - +a.isPrimary)
			.map(({ collection }) => collection.title),
		custom_elements: [
			...getAllPubContributors(pubData, false, true).map((attribution) => {
				return {
					'dc:creator': getContributorName(attribution),
				};
			}),
			pubData.avatar && createEnclosure(pubData.avatar),
			bestPdf && createEnclosure(bestPdf),
			xmlExport && createEnclosure(xmlExport),
		],
	};
};

export const getCommunityRss = async (communityData, query) => {
	const communityUrl = getCommunityUrl(communityData);
	const pubIds = await getQueriedPubIds({
		communityId: communityData.id,
		limit: 25,
		query: query,
	});
	const pubs = await getPubData(pubIds);

	const feed = new RSS({
		title: communityData.title,
		description: communityData.description,
		feed_url: `${communityUrl}/rss.xml`,
		site_url: communityUrl,
		image_url: communityData.favicon,
		webMaster: 'hello@pubpub.org',
		language: 'en',
		pubDate: new Date(),
		ttl: '60',
	});

	pubs.forEach((pubData) => feed.item(getFeedItemForPub(pubData, communityData)));
	return feed.xml();
};
