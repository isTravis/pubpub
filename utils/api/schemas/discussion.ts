import * as types from 'types';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { baseSchema } from '../utils/baseSchema';
import { docJsonSchema } from './release';
import { userSchema } from './user';

extendZodWithOpenApi(z);

const discussionAuthorSchema = userSchema
	.pick({
		id: true,
		firstName: true,
		lastName: true,
		avatar: true,
		fullName: true,
		slug: true,
		initials: true,
		title: true,
		orcid: true,
	})
	.optional();

export const discussionAnchorSchema = baseSchema.extend({
	isOriginal: z.boolean(),
	discussionId: z.string().uuid(),
	historyKey: z.number().int(),
	selection: z
		.object({
			head: z.number().int(),
			type: z.string(),
			anchor: z.number().int(),
		})
		.nullable(),
	originalText: z.string(),
	originalTextPrefix: z.string(),
	originalTextSuffix: z.string(),
});

export const baseDiscussionSchema = baseSchema.extend({
	title: z.string().nullable(),
	number: z.number().int(),
	isClosed: z.boolean().nullable(),
	labels: z.array(z.string()).nullable(),
	threadId: z.string().uuid(),
	visibilityId: z.string().uuid(),
	userId: z.string().uuid().nullable(),
	anchorId: z.string().uuid().nullable(),
	pubId: z.string().uuid().nullable(),
	commenterId: z.string().uuid().nullable(),
}) satisfies z.ZodType<types.Discussion>;

export const commenterSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nullish(),
});

export const discussionSchema = baseDiscussionSchema.extend({
	author: discussionAuthorSchema,
	commenter: commenterSchema.nullish(),
	anchors: z.array(discussionAnchorSchema).optional(),
});

export const commentSchema = baseSchema.extend({
	text: z.string().nullable(),
	content: docJsonSchema,
	userId: z.string().uuid().nullable(),
	threadId: z.string().uuid(),
	commenterId: z.string().uuid().nullable(),
	author: discussionAuthorSchema,
	commenter: commenterSchema.nullish(),
});

export const threadSchema = baseSchema.extend({
	comments: z.array(commentSchema),
});

export const discussionWithThreadSchema = discussionSchema.extend({
	thread: threadSchema,
});
