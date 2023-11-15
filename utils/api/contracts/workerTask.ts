import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

extendZodWithOpenApi(z);

const c = initContract();

const md = String.raw;

export const workerTaskContract = c.router({
	/**
	 * summary: 'Get a worker task'
	 *
	 * @description
	 * 'Get the status of a worker task. This is used to poll for the status of a worker task, such as an import or export.'
	 */
	get: {
		path: '/api/workerTasks',
		method: 'GET',
		summary: 'Get a worker task',
		description:
			'Get the status of a worker task. This is used to poll for the status of a worker task, such as an import or export.',
		query: z.object({
			workerTaskId: z.string().uuid(),
		}),
		responses: {
			201: z.object({
				id: z.string().uuid(),
				isProcessing: z.boolean().nullable(),
				error: z.any().nullable(),
				output: z.any().nullable(),
			}),
			404: z.object({
				error: z.literal('WorkerTask not found'),
			}),
		},
		metadata: {
			example: md`
				# hey

				-   hey
				-   ho

				## h

				~~~ts
				function go() {}
				hello;
				~~~

				    const x = 'hey';
				    function gamed({ hey }) {}




			`,
		},
	},
});
