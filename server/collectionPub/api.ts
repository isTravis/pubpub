import app from 'server/server';
import { ForbiddenError } from 'server/utils/errors';

import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

import { createGetRequestIds } from 'utils/getRequestIds';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import { contract } from 'utils/api/contract';
import {
	canCreateCollectionPub,
	canDestroyCollectionPub,
	getUpdatableFieldsForCollectionPub,
} from './permissions';
import {
	createCollectionPub,
	updateCollectionPub,
	destroyCollectionPub,
	getPubsInCollection,
} from './queries';

extendZodWithOpenApi(z);

const getRequestIds = createGetRequestIds<{
	communityId?: string;
	pubId?: string;
	collectionId?: string;
	collectionPubId?: string;
}>();

// const getRequestIds = (req, argsFrom = req.body) => {
// 	const user = req.user || {};
// 	return {
// 		userId: user.id,
// 		pubId: argsFrom.pubId || null,
// 		collectionId: argsFrom.collectionId,
// 		communityId: argsFrom.communityId,
// 		collectionPubId: argsFrom.id,
// 	};
// };

// app.get(
// 	'/api/collectionPubs',
// 	validate({
// 		tags: ['CollectionPubs'],
// 		description: 'Get the pubs associated with a collection',
// 		security: false,
// 		query: {
// 			pubId: z.string().uuid().optional(),
// 			collectionId: z.string().uuid(),
// 			communityId: z.string().uuid(),
// 		},
// 		response: z.array(pubSchema),
// 	}),
// 	wrap(async (req, res) => {
// 		req.body = req.query;
// 		const reqq = req as typeof req & { body: typeof req.query };

// 		const pubsInCollection = await getPubsInCollection(getRequestIds(reqq));
// 		return res.status(200).json(pubsInCollection);
// 	}),
// );

// export const createCollectionPubSchema = collectionPubSchema
// 	.pick({
// 		pubId: true,
// 		collectionId: true,
// 	})
// 	.merge(
// 		collectionPubSchema
// 			.pick({
// 				rank: true,
// 				moveToTop: true,
// 			})
// 			.partial(),
// 	)
// 	.merge(
// 		z.object({
// 			communityId: z.string().uuid(),
// 			moveToTop: z.boolean().optional(),
// 		}),
// 	);

// app.post(
// 	'/api/collectionPubs',
// 	validate({
// 		tags: ['CollectionPubs'],
// 		description: 'Add a pub to a collection',
// 		body: createCollectionPubSchema,
// 		statusCodes: {
// 			201: collectionPubSchema,
// 		},
// 	}),
// 	wrap(async (req, res) => {
// 		const { collectionId, pubId, userId, communityId } = getRequestIds(req);
// 		const { rank, moveToTop } = req.body;
// 		const canCreate = await canCreateCollectionPub({
// 			userId,
// 			communityId,
// 			collectionId,
// 			pubId,
// 		});
// 		if (!canCreate) {
// 			throw new ForbiddenError();
// 		}
// 		const collectionPub = await createCollectionPub({
// 			collectionId,
// 			pubId,
// 			rank,
// 			moveToTop,
// 			actorId: userId,
// 		});
// 		return res.status(201).json(collectionPub);
// 	}),
// );

// const updateCollectionPubSchema = collectionPubSchema
// 	.omit({ id: true })
// 	.partial()
// 	.merge(collectionPubSchema.pick({ id: true }));

// app.put(
// 	'/api/collectionPubs',
// 	validate({
// 		tags: ['CollectionPubs'],
// 		description: 'Change the pubs that are associated with a collection',
// 		body: updateCollectionPubSchema.merge(
// 			z.object({
// 				communityId: z.string().uuid(),
// 			}),
// 		),
// 		response: updateCollectionPubSchema.omit({ id: true }),
// 	}),
// 	wrap(async (req, res) => {
// 		const { id: collectionPubId, communityId, userId } = getRequestIds(req);
// 		const updatableFields = await getUpdatableFieldsForCollectionPub({
// 			communityId,
// 			collectionPubId,
// 			userId,
// 		});
// 		if (!updatableFields) {
// 			throw new ForbiddenError();
// 		}
// 		const updated = await updateCollectionPub(collectionPubId, req.body, updatableFields);
// 		return res.status(200).json(updated);
// 	}),
// );

// app.delete(
// 	'/api/collectionPubs',
// 	validate({
// 		tags: ['CollectionPubs'],
// 		description: 'Remove a pub from a collection',
// 		body: z.object({
// 			id: z.string().uuid(),
// 			communityId: z.string().uuid(),
// 		}),
// 		response: z.string().uuid(),
// 	}),
// 	wrap(async (req, res) => {
// 		const { id: collectionPubId, communityId, userId } = getRequestIds(req);
// 		const canDestroy = await canDestroyCollectionPub({
// 			communityId,
// 			collectionPubId,
// 			userId,
// 		});
// 		if (!canDestroy) {
// 			throw new ForbiddenError();
// 		}
// 		await destroyCollectionPub(collectionPubId, userId);
// 		return res.status(200).json(req.body.id);
// 	}),
// );

const s = initServer();

export const collectionPubServer = s.router(contract.collectionPub, {
	get: async ({ req, query }) => {
		const pubsInCollection = await getPubsInCollection(getRequestIds(query, req.user));
		return {
			status: 200,
			body: pubsInCollection,
		};
	},
	create: async ({ body, req }) => {
		const { collectionId, pubId, userId, communityId } = getRequestIds(body, req.user);
		const { rank, moveToTop } = body;
		const canCreate = await canCreateCollectionPub({
			userId,
			communityId,
			collectionId,
			pubId,
		});
		if (!canCreate) {
			throw new ForbiddenError();
		}
		const collectionPub = await createCollectionPub({
			collectionId,
			pubId,
			rank,
			moveToTop,
			actorId: userId,
		});
		return {
			status: 201,
			body: collectionPub,
		};
		// return res.status(201).json(collectionPub);
	},
	update: async ({ req, body }) => {
		const { id: collectionPubId, communityId, userId } = getRequestIds(body, req.user);
		const updatableFields = await getUpdatableFieldsForCollectionPub({
			communityId,
			collectionPubId,
			userId,
		});
		if (!updatableFields) {
			throw new ForbiddenError();
		}
		const updated = await updateCollectionPub(collectionPubId, body, updatableFields);
		return {
			status: 200,
			body: updated,
		};
	},
	remove: async ({ req, body }) => {
		const { id: collectionPubId, communityId, userId } = getRequestIds(body, req.user);
		const canDestroy = await canDestroyCollectionPub({
			communityId,
			collectionPubId,
			userId,
		});
		if (!canDestroy) {
			throw new ForbiddenError();
		}
		await destroyCollectionPub(collectionPubId, userId);
		return {
			status: 200,
			body: body.id,
		};
	},
});

// createExpressEndpoints(contract.collectionPub, collectionPubServer, app);
