import { AppRouter } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

extendZodWithOpenApi(z);

export const authTokenRouter = {
	create: {
		path: '/api/authToken',
		method: 'POST',
		summary: 'Create a new authentication token',
		description:
			'Create a new authentication token. Only accessible to admins. Tokens are scoped to a specific community and user.',
		body: z.object({
			communityId: z.string().uuid().openapi({
				description: 'The ID of the community to which the token will be scoped',
			}),
			expiresAt: z.enum(['never', '1d', '1w', '1m', '3m', '1y']).openapi({
				description: 'The expiration date of the token',
			}),
		}),
		responses: {
			201: z.object({
				id: z.string().uuid(),
				userId: z.string().uuid(),
				communityId: z.string().uuid(),
				token: z.string(),
				expiresAt: z.string().datetime().nullable(),
			}),
		},
	},
	remove: {
		path: '/api/authToken/:id',
		method: 'DELETE',
		summary: 'Delete an authentication token',
		description: 'Delete an authentication token. Only accessible to admins.',
		pathParams: z.object({
			id: z.string().uuid(),
		}),
		body: z.union([z.null(), z.object({})]).optional(),
		responses: {
			200: z.string().uuid(),
		},
	},
	removeByToken: {
		path: '/api/authToken',
		method: 'DELETE',
		summary: 'Delete an authentication token by token',
		description: 'Delete an authentication token by token. Only accessible to super admins.',
		body: z.object({
			token: z.string(),
		}),
		responses: {
			200: z.string().uuid(),
		},
	},
} as const satisfies AppRouter;

type AuthTokenType = typeof authTokenRouter;

export interface AuthTokenRouter extends AuthTokenType {}
