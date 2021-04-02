import {
	Collection,
	CollectionAttribution,
	CollectionPub,
	Community,
	CrossrefDepositRecord,
	Export,
	Page,
	PubAttribution,
	PubEdge,
	Release,
	Discussion,
	DiscussionAnchor,
	ReviewNew,
	Member,
	includeUserModel,
	Draft,
} from 'server/models';

import { getPubEdgeIncludes, PubEdgeIncludesOptions } from './pubEdgeOptions';
import { baseAuthor, baseThread, baseVisibility } from './util';

export type PubGetOptions = {
	isAuth?: boolean;
	isPreview?: boolean;
	getCollections?: boolean;
	getMembers?: boolean;
	getCommunity?: boolean;
	getExports?: boolean;
	getEdges?: 'all' | 'approved-only';
	getDraft?: boolean;
	getDiscussions?: boolean;
	getReviews?: boolean;
	getEdgesOptions?: PubEdgeIncludesOptions;
};

export default ({
	isAuth,
	isPreview,
	getCollections,
	getMembers,
	getCommunity,
	getEdges = 'approved-only',
	getEdgesOptions,
	getExports,
	getDraft,
	getDiscussions,
}: PubGetOptions) => {
	const allowUnapprovedEdges = getEdges === 'all';
	/* Initialize values assuming all inputs are false. */
	/* Then, iterate over each input and adjust */
	/* variables as needed */
	let pubAttributes;
	let pubAttributions = [
		{
			model: PubAttribution,
			as: 'attributions',
			separate: true,
			include: [includeUserModel({ as: 'user' })],
		},
	];
	let pubMembers: any = [];
	let pubEdges: any = [];
	let pubReleases = [
		{
			model: Release,
			as: 'releases',
		},
	];
	let collectionPubs: any = [];
	let community: any = [];
	let anchors = [{ model: DiscussionAnchor, as: 'anchors' }];
	let author = baseAuthor;
	let thread = baseThread;
	if (isPreview) {
		pubAttributes = [
			'id',
			'slug',
			'title',
			'description',
			'labels',
			'avatar',
			'doi',
			'communityId',
			'customPublishedAt',
			'createdAt',
			'updatedAt',
		];
		author = [];
		thread = [];
		anchors = [];
	}
	if (isAuth) {
		pubAttributes = ['id'];
		pubReleases = [];
		pubAttributions = [];
		author = [];
		thread = [];
		anchors = [];
	}
	if (getMembers) {
		pubMembers = [{ model: Member, as: 'members' }];
	}
	if (getEdges) {
		pubEdges = [
			{
				model: PubEdge,
				as: 'outboundEdges',
				separate: true,
				include: getPubEdgeIncludes({
					...getEdgesOptions,
					includeTargetPub: true,
				}),
				order: [['rank', 'ASC']],
			},
			{
				model: PubEdge,
				as: 'inboundEdges',
				separate: true,
				include: getPubEdgeIncludes({ ...getEdgesOptions, includePub: true }),
				where: !allowUnapprovedEdges && { approvedByTarget: true },
				order: [['rank', 'ASC']],
			},
		];
	}
	if (getCollections) {
		collectionPubs = [
			{
				model: CollectionPub,
				as: 'collectionPubs',
				separate: true,
				order: [['pubRank', 'ASC']],
				include: [
					{
						model: Collection,
						as: 'collection',
						include: [
							{
								model: Page,
								as: 'page',
								attributes: ['id', 'title', 'slug'],
							},
							{
								model: Member,
								as: 'members',
							},
							{
								model: CollectionAttribution,
								as: 'attributions',
								include: [includeUserModel({ as: 'user' })],
							},
						],
					},
				],
			},
		];
	}
	if (getCommunity) {
		community = [
			{
				model: Community,
				as: 'community',
				attributes: [
					'id',
					'subdomain',
					'domain',
					'title',
					'accentColorLight',
					'accentColorDark',
					'headerLogo',
					'headerColorType',
				],
			},
		];
	}
	const visibility = baseVisibility;
	return {
		attributes: pubAttributes,
		include: [
			...pubAttributions,
			...pubReleases,
			...pubMembers,
			...pubEdges,
			getExports && {
				model: Export,
				as: 'exports',
			},
			getDraft && {
				model: Draft,
				as: 'draft',
			},
			getDiscussions && {
				separate: true,
				model: Discussion,
				as: 'discussions',
				include: [...author, ...anchors, ...visibility, ...thread],
			},
			{
				separate: true,
				model: ReviewNew,
				as: 'reviews',
				include: [...author, ...visibility, ...thread],
			},
			{
				model: CrossrefDepositRecord,
				as: 'crossrefDepositRecord',
			},
			...collectionPubs,
			...community,
		].filter((x) => x),
	};
};
