import type { TsRestRequest } from '@ts-rest/express';
import { AppRouteQuery, ServerInferRequest } from '@ts-rest/core';
import { ModelCtor } from 'sequelize-typescript';
import { isCommunityAdmin } from 'server/community/queries';
import { ForbiddenError, NotFoundError } from 'server/utils/errors';
import { Express, Response } from 'express-serve-static-core';
import { createIncludes } from './include';

export const queryOne =
	<M extends ModelCtor>(model: M) =>
	async <T extends AppRouteQuery>(
		input: ServerInferRequest<T, Express['request']['headers']> & {
			req: TsRestRequest<T>;
			res: Response;
		},
	) => {
		const { req, query, params } = input;

		const [canAdmin] = await isCommunityAdmin(req);

		if (!canAdmin) {
			throw new ForbiddenError();
		}

		const { id } = params;
		const { attributes, include } = query;

		const result = (await model.findOne({
			where: { id },
			...(attributes && { attributes }),
			...(include && { include: createIncludes(model, include) }),
		})) as InstanceType<M>;

		if (!result) {
			throw new NotFoundError();
		}

		return {
			body: result.toJSON(),
			status: 200 as const,
		};
	};
