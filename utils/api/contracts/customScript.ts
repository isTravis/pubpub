import type { AppRouter } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { createCustomScriptSchema, customScriptSchema } from '../schemas/customScript';
import { Metadata } from '../utils/metadataType';

extendZodWithOpenApi(z);

export const customScriptRouter = {
	/**
	 * `POST /api/customScripts`
	 *
	 * Set a custom scripts, i.e. the CSS or JS (if you have access) for this community
	 *
	 * @example
	 *
	 * ```ts
	 * const pubpub = await PubPub.createSDK({
	 * 	// ...
	 * });
	 * const { body } = await pubpub.customScript.set({
	 * 	type: 'css', // js only if your community has access to it
	 * 	content: '...', // raw css
	 * });
	 * ```
	 *
	 * @access admin only
	 *
	 * @apiDocs
	 * {@link https://pubpub.org/apiDocs#/paths/api-customScripts/post}
	 */
	set: {
		path: '/api/customScripts',
		method: 'POST',
		summary: 'Set a custom script',
		description:
			'Set a custom scripts, i.e. the CSS or JS (if you have access) for this community',
		body: createCustomScriptSchema,
		responses: {
			200: customScriptSchema,
		},
		metadata: {
			loggedIn: 'admin',
			example: `~~~ts
const pubpub = await PubPub.createSDK({
	// ...
})
const { body } = await pubpub.customScript.set({
	type: 'css', // js only if your community has access to it
	content: '...', // raw css	
})
~~~`,
		} satisfies Metadata,
	},
} as const satisfies AppRouter;

type CustomScriptRouterType = typeof customScriptRouter;

export interface CustomScriptRouter extends CustomScriptRouterType {}
