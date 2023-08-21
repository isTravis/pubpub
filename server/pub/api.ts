import app, { wrap } from 'server/server';
import { ForbiddenError, NotFoundError } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { PubGetOptions, PubsQuery } from 'types';
import { indexByProperty } from 'utils/arrays';
import { transformPubToResource } from 'deposit/transform/pub';
import { generateDoi } from 'server/doi/queries';
import { assert, expect } from 'utils/assert';
import { prepareResource, submitResource } from 'deposit/datacite/deposit';
import { assertValidResource } from 'deposit/validate';
import * as types from 'types';

import { z } from 'zod';
import { validate } from 'utils/api';
import { Resource, resourceSchema } from 'deposit/resource';
import { Pub } from 'server/models';
import { Request } from 'express';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { createGetRequestIds } from 'utils/getRequestIds';
import { pubAttributionSchema } from 'server/pubAttribution/api';
import { discussionSchema } from 'server/discussion/api';
import { releaseSchema } from 'server/release/api';
import { collectionPubSchema } from 'server/collectionPub/schemas';
import { collectionSchema } from 'server/collection/api';
import { collectionAttributionSchema } from 'server/collectionAttribution/api';
import { getPubsById, queryPubIds } from './queryMany';
import { createPub, destroyPub, findPub, updatePub } from './queries';
import { CanCreatePub, canCreatePub, canDestroyPub, getUpdatablePubFields } from './permissions';

extendZodWithOpenApi(z);

type ManyRequestParams = {
	query: Omit<PubsQuery, 'communityId'>;
	alreadyFetchedPubIds: string[];
	pubOptions: PubGetOptions;
};

const getManyQueryParams = <
	ReqB extends ManyRequestParams,
	A = any,
	B = any,
	C = any,
	D extends Record<string, any> = Record<string, any>,
	R extends Request<A, B, ReqB, C, D> = Request<A, B, ReqB, C, D>,
>(
	req: R,
): ManyRequestParams => {
	const { query, alreadyFetchedPubIds, pubOptions = {} } = req.body;
	const {
		collectionIds,
		excludeCollectionIds,
		excludePubIds,
		isReleased,
		limit = 50,
		offset = 0,
		ordering,
		scopedCollectionId,
		withinPubIds,
		term,
		submissionStatuses,
		relatedUserIds,
	} = query;
	return {
		pubOptions,
		alreadyFetchedPubIds,
		query: {
			collectionIds,
			excludeCollectionIds,
			excludePubIds,
			isReleased,
			limit,
			offset,
			ordering,
			scopedCollectionId,
			withinPubIds,
			term,
			submissionStatuses,
			relatedUserIds,
		},
	};
};

export type GetManyQuery = {
	excludeCollectionIds?: string[];
	ordering?: {
		field: 'updatedDate' | 'creationDate' | 'collectionRank' | 'title';
		direction: 'ASC' | 'DESC';
	};
	limit?: number;
	offset?: number;
	isReleased?: boolean;
	scopedCollectionId?: string;
	withinPubIds?: string[];
	term?: string;
	submissionStatuses?: types.SubmissionStatus[];
	relatedUserIds?: string[];
} & (
	| { collectionIds: string[]; pubIds?: undefined }
	| { pubIds: string[]; collectionIds?: undefined }
	| { pubIds?: undefined; collectionIds?: undefined }
);

export const pubSchema = z.object({
	id: z.string().uuid(),
	slug: z
		.string({
			description: 'Slug',
		})
		.regex(/^[a-zA-Z0-9-]+$/)
		.min(1)
		.max(280)
		.openapi({
			uniqueItems: true,
			example: 'some-slug',
		}),
	title: z.string().openapi({
		example: 'A beautiful title',
	}),
	htmlTitle: z.string().nullable().openapi({
		example: 'A <strong>beautiful</strong> <em>title</em>',
		description:
			'HTML version of the title, allows for things like <strong>bold</strong> and <em>italics</em>',
	}),
	description: z.string().max(280).min(0).nullable(),
	htmlDescription: z.string().max(280).min(0).nullable(),
	avatar: z.string({}).nullable().openapi({
		description: 'The preview image of a Pub',
	}),
	doi: z.string().nullable().openapi({
		example: '10.1101/2020.05.01.072975',
		description: 'The DOI of the pub',
	}),
	downloads: z
		.array(
			z.object({
				url: z.string().url(),
				type: z.literal('formatted'),
				createdAt: z
					.string()
					.datetime()
					.default(() => new Date().toISOString()),
			}),
		)
		.nullable(),
	customPublishedAt: z.string().datetime().nullable(),
	labels: z
		.array(
			z.object({
				id: z.string().uuid(),
				color: z.string(),
				title: z.string(),
				publicApply: z.boolean(),
			}),
		)
		.nullable(),
	viewHash: z.string().nullable(),
	reviewHash: z.string().nullable(),
	editHash: z.string().nullable(),
	commentHash: z.string().nullable(),
	communityId: z.string().uuid(),
	metadata: z
		.object({
			mtg_id: z.string().openapi({ example: 'aas241' }),
			bibcode: z.string().openapi({ example: '2023AAS…24130111A' }),
			mtg_presentation_id: z.string().openapi({ example: '301.11' }),
		})
		.nullable(),
	draftId: z.string().uuid(),
	scopeSummaryId: z.string().uuid().nullable(),
	crossrefDepositRecordId: z.string().uuid().nullable(),
}) satisfies z.ZodType<types.Pub>;

export const getManyQuerySchema = z.object({
	query: z
		.object({
			excludeCollectionIds: z.array(z.string().uuid()).optional(),
			ordering: z.object({
				field: z.enum(['updatedDate', 'creationDate', 'collectionRank', 'title']),
				direction: z.enum(['ASC', 'DESC']),
			}),
			limit: z.number().optional().default(50),
			offset: z.number().optional().default(0),
		})
		.and(
			z.union([
				z.object({
					collectionIds: z.array(z.string().uuid()),
					pubIds: z.undefined().optional(),
				}),
				z.object({
					pubIds: z.array(z.string().uuid()),
					collectionIds: z.undefined().optional(),
				}),
				z.object({
					pubIds: z.undefined().optional(),
					collectionIds: z.undefined().optional(),
				}),
			]),
		) satisfies z.ZodType<GetManyQuery>,
	alreadyFetchedPubIds: z.array(z.string()),
	pubOptions: z.object({
		isAuth: z.boolean().optional(),
		isPreview: z.boolean().optional(),
		getCollections: z.boolean().optional(),
		getMembers: z.boolean().optional(),
		getCommunity: z.boolean().optional(),
		getExports: z.boolean().optional(),
		getEdges: z.enum(['all', 'approved-only']).optional(),
		getDraft: z.boolean().optional(),
		getDiscussions: z.boolean().optional(),
		getReviews: z.boolean().optional(),
		getEdgesOptions: z
			.object({
				includeCommunityForPubs: z.boolean().optional(),
				includeTargetPub: z.boolean().optional(),
				includePub: z.boolean().optional(),
			})
			.optional(),
		getSubmissions: z.boolean().optional(),
		getFacets: z.boolean().optional(),
	}) satisfies z.ZodType<PubGetOptions>,
}) satisfies z.ZodType<ManyRequestParams>;

const sanitizedPubSchema = pubSchema.merge(
	z.object({
		attributions: pubAttributionSchema.array(),
		discussions: z.array(discussionSchema),
		collectionPubs: z.array(
			collectionPubSchema.merge(
				z.object({
					collection: collectionSchema.merge(
						z.object({
							attributions: z.array(collectionAttributionSchema),
						}),
					),
				}),
			),
		),
		isRelease: z.boolean(),
		releases: z.array(releaseSchema),
		releaseNumber: z.number().nullable(),
	}),
) satisfies z.ZodType<types.SanitizedPubData, any, any>;

app.post(
	'/api/pubs/many',
	validate({
		summary: 'Search for Pubs',
		description: 'Get many pubs',
		tags: ['Pub'],
		security: false,
		body: getManyQuerySchema,
		response: z.object({
			pubIds: z.array(z.string()),
			pubsById: z.record(sanitizedPubSchema), // as z.ZodType<Record<string, types.SanitizedPubData>>,
			loadedAllPubs: z.boolean().or(z.number()).optional().nullable(),
		}),
	}),
	wrap(async (req, res) => {
		const initialData = await getInitialData(req);
		const { query: queryPartial, alreadyFetchedPubIds, pubOptions } = getManyQueryParams(req);
		const { limit } = queryPartial;
		const pubIds = await queryPubIds({
			...queryPartial,
			communityId: initialData.communityData.id,
		});
		const loadedAllPubs = limit && limit > pubIds.length;
		const idsToFetch = pubIds.filter((id) => !alreadyFetchedPubIds.includes(id));
		const pubs = await getPubsById(idsToFetch, pubOptions).sanitize(initialData);
		const pubsById = indexByProperty(pubs, 'id');
		return res.status(200).json({
			pubIds: pubIds.filter((id) => !!pubsById[id] || alreadyFetchedPubIds.includes(id)),
			pubsById,
			loadedAllPubs,
		});
	}),
);

const getRequestIds = createGetRequestIds<{
	communityId?: string;
	collectionId?: string;
	pubId?: string;
	createPubToken?: string;
}>();

app.post(
	'/api/pubs',
	validate({
		description: 'Create a Pub',
		security: true,
		tags: ['Pub'],
		body: z
			.object({
				communityId: z.string(),
			})
			.and(
				z.union([
					z.object({
						collectionId: z.string().optional(),
						createPubToken: z.undefined(),
					}),
					z.object({
						createPubToken: z.string().optional(),
						collectionId: z.undefined(),
					}),
					z.object({
						createPubToken: z.undefined(),
						collectionId: z.undefined(),
					}),
				]),
			) satisfies z.ZodType<CanCreatePub>,
		statusCodes: {
			201: pubSchema,
		},
	}),

	wrap(async (req, res) => {
		//		try {
		const ids = getRequestIds(req);
		const { create, collectionIds } = await canCreatePub(ids);
		if (create) {
			const newPub = await createPub(
				{ communityId: ids.communityId, collectionIds },
				ids.userId,
			);
			const jsonedPub = newPub.toJSON();
			return res.status(201).json(jsonedPub);
		}
		throw new ForbiddenError();
		// } catch (e) {
		// 	console.error(e);
		// 	throw new Error(e as any);
		// }
	}),
);

export type PubPut = types.UpdateParams<Pub> & { pubId: string };

export const pubPutSchema = pubSchema
	.partial()
	.omit({
		communityId: true,
		draftId: true,
		scopeSummaryId: true,
		crossrefDepositRecordId: true,
	})
	.merge(
		z.object({
			pubId: z.string(),
		}),
	) satisfies z.ZodType<PubPut>;

app.put(
	'/api/pubs',
	validate({
		tags: ['Pub'],
		description: 'Update a Pub',
		body: pubPutSchema,
		response: pubPutSchema.omit({
			pubId: true,
		}),
	}),
	wrap(async (req, res) => {
		const { userId, pubId } = getRequestIds(req);
		const updatableFields = await getUpdatablePubFields({
			userId,
			pubId,
		});
		if (!updatableFields) {
			throw new ForbiddenError();
		}

		const updateResult = await updatePub(req.body, updatableFields, userId);
		return res.status(200).json(updateResult);
	}),
);

app.delete(
	'/api/pubs',
	validate({
		description: 'Delete a Pub',
		summary: 'Delete a Pub fr fr',
		tags: ['Pub'],
		body: z.object({
			pubId: z.string(),
		}),
		response: {},
	}),
	// eslint-disable-next-line consistent-return
	wrap(async (req, res) => {
		const { userId, pubId } = getRequestIds(req);
		const canDestroy = await canDestroyPub({ userId, pubId });
		if (!canDestroy) {
			throw new ForbiddenError();
		}

		await destroyPub(pubId, userId);
		return res.status(200).json({});
	}),
);

app.get(
	'/api/pub/:pubId/resource',
	validate({
		description: 'Get a Pub Resource',
		tags: ['Pub'],

		response: resourceSchema satisfies z.ZodType<Resource>,
	}),

	wrap(async (req, res) => {
		const { pubId } = req.params;
		const pub = await findPub(pubId);
		if (!pub) {
			throw new NotFoundError();
		}
		const jsonedPub = pub.toJSON();
		const resource = await transformPubToResource(jsonedPub, expect(jsonedPub.community));
		return res.status(200).json(resource);
	}),
);

const resourceASTSchema = z.object({
	type: z.literal('element'),
	name: z.string(),
	attributes: z.record(z.string()).optional(),
	children: z.array(z.any()).optional(),
});

type ResourceAST = Awaited<ReturnType<typeof submitResource>>['resourceAst'];
app.post(
	'/api/pub/:pubId/doi',
	validate({
		tags: ['Pub'],
		description: 'Create a DOI for a Pub',
		response: resourceASTSchema satisfies z.ZodType<ResourceAST>,
		statusCodes: {
			400: {
				error: z.string(),
			},
		},
	}),
	wrap(async (req, res) => {
		const { pubId } = req.params;
		const pubFields = await getUpdatablePubFields({ userId: req.user.id, pubId });
		try {
			assert(expect(pubFields).some((f) => f === 'doi'));
		} catch {
			throw new ForbiddenError();
		}
		const pub = await findPub(pubId);
		if (!pub) {
			return new NotFoundError();
		}
		const pubDoi =
			pub.doi ??
			(
				await generateDoi(
					{ communityId: pub.communityId, pubId, collectionId: undefined },
					'pub',
				)
			).pub;
		const jsonedPub = pub.toJSON();
		const resource = await transformPubToResource(jsonedPub, expect(jsonedPub.community));
		try {
			assertValidResource(resource);
		} catch (error) {
			return res.status(400).json({ error: (error as Error).message });
		}
		try {
			const { resourceAst } = await submitResource(pub, resource, expect(pubDoi), {
				pubId,
			});
			return res.status(200).json(resourceAst);
		} catch (error) {
			return res.status(400).json({ error: (error as Error).message });
		}
	}),
);

app.post(
	'/api/pub/:pubId/doi/preview',
	validate({
		tags: ['Pub'],
		description: 'Preview a pubs DOI deposit',
		response: resourceASTSchema satisfies z.ZodType<ResourceAST>,
		statusCodes: {
			400: {
				error: z.string(),
			},
		},
	}),
	wrap(async (req, res) => {
		const { pubId } = req.params;
		const pubFields = await getUpdatablePubFields({ userId: req.user.id, pubId });
		try {
			assert(expect(pubFields).some((f) => f === 'doi'));
		} catch {
			throw new ForbiddenError();
		}
		const pub = expect(await findPub(pubId));
		const pubDoi =
			pub.doi ??
			(
				await generateDoi(
					{ communityId: pub.communityId, pubId, collectionId: undefined },
					'pub',
				)
			).pub;
		const jsonedPub = pub.toJSON();
		const resource = await transformPubToResource(jsonedPub, expect(jsonedPub.community));
		try {
			assertValidResource(resource);
		} catch (error) {
			return res.status(400).json({ error: (error as Error).message });
		}
		try {
			const { resourceAst } = await prepareResource(pub, resource, expect(pubDoi));
			return res.status(200).json(resourceAst);
		} catch (error) {
			return res.status(400).json({ error: (error as Error).message });
		}
	}),
);
