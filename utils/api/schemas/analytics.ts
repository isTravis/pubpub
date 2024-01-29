import { z } from 'zod';

export const baseSchema = z.object({
	type: z.enum(['page', 'track']),
	event: z.string(),
	timestamp: z.number(),
});

export const basePageViewSchema = baseSchema.merge(
	z.object({
		type: z.literal('page'),
		url: z.string().url(),
		title: z.string(),
		hash: z.string().optional(),
		height: z.number().int(),
		width: z.number().int(),
		path: z.string().optional(),
		referrer: z.string().nullish(),
		unique: z.boolean().optional(),
		search: z.string().optional(),
		utm: z
			.object({
				source: z.string().optional(),
				medium: z.string().optional(),
				campaign: z.string().optional(),
				term: z.string().optional(),
				content: z.string().optional(),
			})
			.optional(),
	}),
);

export const sharedPageViewPayloadSchema = z.object({
	communityId: z.string().uuid(),
	communityName: z.string(),
	event: z.enum(['page', 'collection', 'pub']),
});

export const pagePageViewPayloadSchema = sharedPageViewPayloadSchema.merge(
	z.object({
		event: z.literal('page'),
		pageTitle: z.string(),
		pageId: z.string(),
		pageSlug: z.string(),
	}),
);

export const collectionPageViewPayloadSchema = sharedPageViewPayloadSchema.merge(
	z.object({
		event: z.literal('collection'),
		collectionTitle: z.string(),
		collectionKind: z.enum(['issue', 'conference', 'book', 'tag']),
		collectionId: z.string().uuid(),
		collectionSlug: z.string(),
	}),
);

export const pubPageViewPayloadSchema = sharedPageViewPayloadSchema
	.merge(
		z.object({
			event: z.literal('pub'),
			pubTitle: z.string(),
			pubId: z.string().uuid(),
			pubSlug: z.string(),
			collectionIds: z.array(z.string().uuid()),
			primaryCollectionId: z.string().uuid().optional(),
		}),
	)
	.merge(collectionPageViewPayloadSchema.omit({ event: true }).partial());

export const pageViewPayloadSchema = z.discriminatedUnion('event', [
	pagePageViewPayloadSchema,
	collectionPageViewPayloadSchema,
	pubPageViewPayloadSchema,
]);

export const pageViewSchema = pageViewPayloadSchema.and(basePageViewSchema);

export const pubDownloadPayloadSchema = z.object({
	format: z.string(),
	pubId: z.string().uuid(),
});

export const pubDownloadSchema = baseSchema.merge(
	pubDownloadPayloadSchema.extend({
		type: z.literal('track'),
		event: z.literal('download'),
	}),
);

export const analyticsEventSchema = z.union([pubDownloadSchema, pageViewSchema]);
