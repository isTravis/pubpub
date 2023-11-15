import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

import { createGetManyQueryOptions, createGetQueryOptions } from 'utils/query';

import { resourceSchema } from '../schemas/resource';
import {
	getManyQuerySchema,
	pubPostSchema,
	pubPutSchema,
	pubSchema,
	pubWithRelationsSchema,
	resourceASTSchema,
	sanitizedPubSchema,
} from '../schemas/pub';

extendZodWithOpenApi(z);

const c = initContract();

export const pubContract = c.router({
	/**
	 * summary: "Get a pub by it's slug or id"
	 *
	 * @description
	 * "Get a pub by it's slug or id.\n\n The slug is the thing after `/pub/` in the URL, but before `/release` or `/draft`."
	 */
	get: {
		path: '/api/pubs/:slugOrId',
		method: 'GET',
		summary: "Get a pub by it's slug or id",
		description:
			"Get a pub by it's slug or id.\n\n The slug is the thing after `/pub/` in the URL, but before `/release` or `/draft`.",
		pathParams: z.object({
			slugOrId: z.string().openapi({
				description:
					'The id is a UUID, the slug is a string. The slug is `/pub/<slug>/` <- this part',
			}),
		}),
		query: createGetQueryOptions(pubWithRelationsSchema, {
			include: {
				options: [
					'attributions',
					'collectionPubs',
					'community',
					'draft',
					'members',
					'releases',
					'reviews',
					'submission',
					'inboundEdges',
					'outboundEdges',
				],
				defaults: ['attributions', 'draft'],
			},
		}),
		responses: {
			200: pubWithRelationsSchema,
		},
	},
	getMany: {
		path: '/api/pubs',
		method: 'GET',
		summary: 'Get many pubs',
		description: 'Get many pubs',
		query: createGetManyQueryOptions(pubWithRelationsSchema, {
			sort: {
				options: ['title', 'slug'],
			},
			include: {
				options: [
					'attributions',
					'collectionPubs',
					'community',
					'draft',
					'members',
					'releases',
					'reviews',
					'submission',
					'inboundEdges',
					'outboundEdges',
				],
				defaults: ['attributions', 'draft'],
			},
		}),
		responses: {
			200: z.array(pubWithRelationsSchema),
		},
	},
	create: {
		path: '/api/pubs',
		method: 'POST',
		summary: 'Create a Pub',
		description: 'Create a Pub',
		body: pubPostSchema,
		responses: {
			201: pubSchema,
		},
	},
	update: {
		path: '/api/pubs',
		method: 'PUT',
		summary: 'Update a Pub',
		description: 'Update a Pub',
		body: pubPutSchema,
		responses: {
			200: pubPutSchema.omit({
				pubId: true,
			}),
		},
	},
	remove: {
		path: '/api/pubs',
		method: 'DELETE',
		summary: 'Remove a Pub',
		description: 'Remove a Pub',
		body: z.object({
			pubId: z.string().uuid(),
		}),
		responses: {
			200: z.object({}),
		},
	},
	queryMany: {
		path: '/api/pubs/many',
		method: 'POST',
		summary: 'Search for Pubs',
		description:
			'Search for many pubs. This is an older alternative to the more standardised `GET /api/pubs`, offering different options.',
		body: getManyQuerySchema,
		responses: {
			200: z.object({
				pubIds: z.array(z.string().uuid()),
				pubsById: z.record(sanitizedPubSchema),
				loadedAllPubs: z.boolean().or(z.number()).optional().nullable(),
			}),
		},
	},
	doi: {
		deposit: {
			path: '/api/pub/:pubId/doi',
			method: 'POST',
			summary: 'Create a DOI',
			description: 'Deposit metadata to create a DOI',
			pathParams: z.object({
				pubId: z.string().uuid(),
			}),
			body: z.null().or(z.object({})).optional(),
			responses: {
				200: resourceASTSchema,
				400: z.object({ error: z.string() }),
			},
		},
		preview: {
			path: '/api/pub/:pubId/doi/preview',
			method: 'POST',
			summary: 'Preview a DOI deposit',
			description: 'Preview a DOI deposit',
			pathParams: z.object({
				pubId: z.string().uuid(),
			}),
			body: z.null().or(z.object({})).optional(),
			responses: {
				200: resourceASTSchema,
				400: z.object({ error: z.string() }),
			},
		},
	},
	getResource: {
		path: '/api/pub/:pubId/resource',
		method: 'GET',
		summary: 'Get pub as a resource',
		description: 'Get pub as a resource',
		pathParams: z.object({
			pubId: z.string().uuid(),
		}),
		responses: {
			200: resourceSchema,
		},
	},
});
