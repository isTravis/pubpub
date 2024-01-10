import { z } from 'zod';
import * as types from 'types';

export const customScriptSchema = z.object({
	id: z.string().uuid(),
	communityId: z.string().uuid().nullable(),
	type: z
		.enum(['css', 'js'], {
			description: 'JS is only available if your community has access to it',
		})
		.nullable(),
	content: z.string().nullable(),
}) satisfies z.ZodType<types.CustomScript>;

export const createCustomScriptSchema = customScriptSchema.omit({ id: true });
