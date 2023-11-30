import type { AppRouter } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { releaseSchema } from '../schemas/release';

extendZodWithOpenApi(z);

export const releaseRouter = {
	/**
	 * summary: 'Create a release'
	 *
	 * @description
	 * 'Create a release'
	 */

	create: {
		path: '/api/releases',
		method: 'POST',
		summary: 'Create a release',
		description: 'Create a release',
		body: z.object({
			pubId: releaseSchema.shape.pubId,
			historyKey: releaseSchema.shape.historyKey.optional().openapi({
				description: "You probably don't want to provide this manually",
			}),
			noteText: releaseSchema.shape.noteText.optional(),
			noteContent: releaseSchema.shape.noteContent.optional(),
		}),
		responses: {
			201: releaseSchema,
			400: z.string(),
		},
	},
} as const satisfies AppRouter;

type ReleaseRouterType = typeof releaseRouter;

export interface ReleaseRouter extends ReleaseRouterType {}
