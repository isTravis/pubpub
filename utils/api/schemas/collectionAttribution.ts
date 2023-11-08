import * as types from 'types';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { CollectionAttribution } from 'server/models';
import {
	attributionCreationSchema,
	attributionSchema,
	updateAttributionSchema,
} from './attribution';
import { collectionSchema } from './collection';
import { userSchema } from './user';

extendZodWithOpenApi(z);

export const collectionAttributionSchema = attributionSchema.extend({
	collectionId: z.string().uuid(),
}) satisfies z.ZodType<types.CollectionAttribution>;

export const batchCollectionAttributionCreationSchema = z.object({
	attributions: z.array(attributionCreationSchema),
	communityId: z.string(),
	collectionId: z.string(),
});

export const collectionAttributionCreationSchema = z
	.object({
		communityId: z.string().uuid(),
		collectionId: z.string().uuid(),
	})
	.and(attributionCreationSchema);

export const collectionAttributionUpdateSchema = updateAttributionSchema.merge(
	z.object({ collectionId: z.string().uuid(), communityId: z.string().uuid() }),
) satisfies z.ZodType<types.UpdateParams<CollectionAttribution>>;

export const collectionAttributionRemoveSchema = z.object({
	id: z.string().openapi({ description: 'The attribution id' }),
	communityId: z.string(),
	collectionId: z.string(),
});
