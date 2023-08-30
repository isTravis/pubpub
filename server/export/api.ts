import { ForbiddenError } from 'server/utils/errors';

import { createGetRequestIds } from 'utils/getRequestIds';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { initServer } from '@ts-rest/express';
import { contract } from 'utils/api/contract';
import { getPermissions } from './permissions';
import { getOrStartExportTask } from './queries';

extendZodWithOpenApi(z);

const getRequestData = createGetRequestIds<{
	accessHash?: string | null;
	format?: string;
	historyKey?: number;
	pubId?: string;
	communityId?: string;
}>();

const s = initServer();

export const exportServer = s.router(contract.export, {
	create: async ({ req, body }) => {
		const { accessHash, format, historyKey, pubId, userId, communityId } = getRequestData(
			body,
			req.user,
		);
		const permissions = await getPermissions({
			accessHash,
			userId,
			pubId,
			communityId,
			historyKey,
		});

		if (!permissions.create) {
			throw new ForbiddenError();
		}

		const result = await getOrStartExportTask({
			format,
			historyKey,
			pubId,
		});

		return { status: 201, body: result };
	},
});
