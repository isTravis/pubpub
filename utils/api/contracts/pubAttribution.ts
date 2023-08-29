import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import {
	batchPubAttributionCreationSchema,
	pubAttributionCreationSchema,
	pubAttributionRemoveSchema,
	pubAttributionSchema,
	pubAttributionUpdateSchema,
} from '../schemas/pubAttribution';
import { updateAttributionSchema } from '../schemas/attribution';

extendZodWithOpenApi(z);

const c = initContract();

export const pubAttributionContract = c.router(
	{
		batchCreate: {
			path: '/api/pubAttributions/batch',
			method: 'POST',
			description: 'Batch create pub attributions',
			body: batchPubAttributionCreationSchema,
			responses: {
				201: z.array(pubAttributionSchema),
			},
		},
		create: {
			path: '/api/pubAttributions',
			method: 'POST',
			description: 'Create a pub attribution',
			body: pubAttributionCreationSchema,
			responses: {
				201: pubAttributionSchema,
				500: z.string(),
			},
		},
		update: {
			path: '/api/pubAttributions',
			method: 'PUT',

			description: 'Update a pub attribution',
			body: pubAttributionUpdateSchema,
			responses: {
				201: updateAttributionSchema.partial().omit({ id: true }),
				500: z.string(),
			},
		},
		remove: {
			path: '/api/pubAttributions',
			method: 'DELETE',
			description: 'Delete a pub attribution',
			body: pubAttributionRemoveSchema,
			responses: {
				201: z
					.string()
					.uuid()
					.openapi({ description: 'The id of the deleted attribution' }),
				500: z.string(),
			},
		},
	},
	{
		strictStatusCodes: true,
	},
);
