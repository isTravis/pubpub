import type { AppRouter } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { pubEdgeCreateSchema, pubEdgeSchema, pubEdgeUpdateSchema } from '../schemas/pubEdge';
import { sanitizedPubSchema } from '../schemas/pub';

extendZodWithOpenApi(z);

export const pubEdgeRouter = {
	/**
	 * `GET /api/pubEdges/:id`
	 *
	 * Get a pubEdge
	 *
	 * @description
	 * Get a pubEdge by id
	 *
	 * @access logged in
	 *
	 * @link https://pubpub.org/apiDocs#/paths/api-pubEdges-id/get
	 */
	get: {
		path: '/api/pubEdges/:id',
		method: 'GET',
		summary: 'Get a pubEdge',
		description: 'Get a pubEdge by id',
		pathParams: z.object({
			id: z.string().uuid(),
		}),
		responses: {
			200: pubEdgeSchema,
		},
	},
	/**
	 * `POST /api/pubEdges`
	 *
	 * Create a pub edge
	 *
	 * @description
	 * Create a connection from one pub to another, or to an external publication
	 *
	 * @access logged in
	 *
	 * @link https://pubpub.org/apiDocs#/paths/api-pubEdges/post
	 */
	create: {
		path: '/api/pubEdges',
		method: 'POST',
		summary: 'Create a pub edge',
		description: 'Create a connection from one pub to another, or to an external publication',
		body: pubEdgeCreateSchema,
		responses: {
			201: pubEdgeSchema.extend({
				targetPub: sanitizedPubSchema.omit({
					releaseNumber: true,
					discussions: true,
					isRelease: true,
				}),
			}),
		},
	},
	/**
	 * `PUT /api/pubEdges`
	 *
	 * Update a pubEdge
	 *
	 * @description
	 * Update a pubEdge
	 *
	 * @access logged in
	 *
	 * @link https://pubpub.org/apiDocs#/paths/api-pubEdges/put
	 */
	update: {
		path: '/api/pubEdges',
		method: 'PUT',
		summary: 'Update a pubEdge',
		description: 'Update a pubEdge',
		body: pubEdgeUpdateSchema,
		responses: { 200: pubEdgeSchema },
	},
	/**
	 * `PUT /api/pubEdges/approvedByTarget`
	 *
	 * Update approvedByTarget for pubEdge
	 *
	 * @description
	 * Update the approvedByTarget field of a pubEdge
	 *
	 * @access logged in
	 *
	 * @link https://pubpub.org/apiDocs#/paths/api-pubEdges-approvedByTarget/put
	 */
	updateApprovedByTarget: {
		path: '/api/pubEdges/approvedByTarget',
		method: 'PUT',
		summary: 'Update approvedByTarget for pubEdge',
		description: 'Update the approvedByTarget field of a pubEdge',
		body: z.object({
			pubEdgeId: z.string().uuid(),
			approvedByTarget: z.boolean(),
		}),
		responses: {
			200: pubEdgeSchema,
		},
	},
	/**
	 * `DELETE /api/pubEdges`
	 *
	 * Remove a pubEdge
	 *
	 * @description
	 * Remove a connection for a pub
	 *
	 * @access logged in
	 *
	 * @link https://pubpub.org/apiDocs#/paths/api-pubEdges/delete
	 */
	remove: {
		path: '/api/pubEdges',
		method: 'DELETE',
		summary: 'Remove a pubEdge',
		description: 'Remove a connection for a pub',
		body: z.object({
			pubEdgeId: z.string().uuid(),
		}),
		responses: {
			200: z.object({}),
		},
	},
} as const satisfies AppRouter;

type PubEdgeRouterType = typeof pubEdgeRouter;

export interface PubEdgeRouter extends PubEdgeRouterType {}
