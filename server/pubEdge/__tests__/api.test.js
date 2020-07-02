/* global it, expect, beforeAll */
import { setup, login, modelize } from 'stubstub';

import { createPubEdge } from 'server/pubEdge/queries';
import { ForeignPublication, PubEdge } from 'server/models';

const models = modelize`
	User yetAnotherPubManager {}
	Community {
		Member {
			permissions: "manage"
			User communityManager {}
		}
		Pub sourcePub {
			Member {
				permissions: "manage"
				User sourcePubManager {}
			}
			Member {
				permissions: "edit"
				User sourcePubEditor {}
			}
		}
		Pub anotherPub {
			Member {
				permissions: "manage"
				User anotherPubManager {}
			}
		}
	}
	Community anotherCommunity {
		Pub targetPub {
			Member {
				permissions: "manage"
				User targetPubManager {}
			}
		}
	}
`;

setup(beforeAll, async () => {
	await models.resolve();
});

it('does not create a PubEdge for a user with edit permissions', async () => {
	const { sourcePubEditor, sourcePub, targetPub } = models;
	const agent = await login(sourcePubEditor);
	await agent
		.post('/api/pubEdges')
		.send({
			pubId: sourcePub.id,
			relationType: 'review',
			pubIsParent: true,
			targetPubId: targetPub.id,
		})
		.expect(403);
});

it('does not let a manager create a Pub targeting their Pub', async () => {
	const { targetPubManager, sourcePub, targetPub } = models;
	const agent = await login(targetPubManager);
	await agent
		.post('/api/pubEdges')
		.send({
			pubId: sourcePub.id,
			relationType: 'review',
			pubIsParent: true,
			targetPubId: targetPub.id,
		})
		.expect(403);
});

it('lets a manager can create a PubEdge to another Pub', async () => {
	const { sourcePubManager, sourcePub, targetPub } = models;
	const agent = await login(sourcePubManager);
	const { body: resultingEdge } = await agent
		.post('/api/pubEdges')
		.send({
			pubId: sourcePub.id,
			relationType: 'review',
			pubIsParent: true,
			targetPubId: targetPub.id,
		})
		.expect(201);
	expect(resultingEdge.pubId).toEqual(sourcePub.id);
	expect(resultingEdge.targetPubId).toEqual(targetPub.id);
	expect(resultingEdge.pubIsParent).toEqual(true);
	expect(resultingEdge.approvedByTarget).toEqual(false);
});

it('lets a manager can create a PubEdge to a foreign publication', async () => {
	const { sourcePubManager, sourcePub } = models;
	const agent = await login(sourcePubManager);
	const foreignPublication = {
		title: 'I am in another journal',
		url: 'https://somewhere.else',
		description: "It's not even on PubPub",
		byline: 'What are we going to do??',
		doi: '10.1000/abcd.1234',
	};
	const { body: resultingEdge } = await agent
		.post('/api/pubEdges')
		.send({
			pubId: sourcePub.id,
			relationType: 'comment',
			pubIsParent: false,
			foreignPublication: foreignPublication,
		})
		.expect(201);
	const resultingForeignPublication = await ForeignPublication.findOne({
		where: { id: resultingEdge.foreignPublicationId },
	});
	Object.entries(foreignPublication).forEach(([key, value]) =>
		expect(resultingForeignPublication[key]).toEqual(value),
	);
	expect(resultingEdge.approvedByTarget).toEqual(false);
});

it('automatically approves edges created by user who can manage both source and target', async () => {
	const { communityManager, sourcePub, anotherPub } = models;
	const agent = await login(communityManager);
	const { body: resultingEdge } = await agent
		.post('/api/pubEdges')
		.send({
			pubId: sourcePub.id,
			relationType: 'review',
			pubIsParent: true,
			targetPubId: anotherPub.id,
		})
		.expect(201);
	expect(resultingEdge.approvedByTarget).toEqual(true);
});

it('Lets a Pub manager update the rank (ordering) of its edges', async () => {
	const { sourcePubManager, sourcePub, anotherPub } = models;
	const existingEdge = await createPubEdge({
		pubId: sourcePub.id,
		targetPubId: anotherPub.id,
		relationType: 'comment',
		pubIsParent: true,
	});
	const agent = await login(sourcePubManager);
	const { body: resultingEdge } = await agent
		.put('/api/pubEdges')
		.send({
			pubEdgeId: existingEdge.id,
			rank: 'q',
			approvedByTarget: true, // This should be ignored
		})
		.expect(200);
	expect(resultingEdge.approvedByTarget).toEqual(false);
	expect(resultingEdge.rank).toEqual('q');
	// Now expect a failure when trying to update the approval
	await agent
		.put('/api/pubEdges/approvedByTarget')
		.send({
			pubEdgeId: existingEdge.id,
			approvedByTarget: true,
		})
		.expect(403);
	await existingEdge.destroy();
});

it('lets the manager of a targetPub update approvedByTarget on an edge (but nothing else)', async () => {
	const { anotherPub, anotherPubManager, sourcePub } = models;
	const existingEdge = await createPubEdge({
		pubId: sourcePub.id,
		targetPubId: anotherPub.id,
		relationType: 'comment',
		pubIsParent: true,
	});
	const agent = await login(anotherPubManager);
	await agent
		.put('/api/pubEdges')
		.send({
			pubEdgeId: existingEdge.id,
			approvedByTarget: true,
			rank: 'zzz',
		})
		.expect(403);
	const { body: resultingEdge } = await agent
		.put('/api/pubEdges/approvedByTarget')
		.send({
			pubEdgeId: existingEdge.id,
			approvedByTarget: true,
		})
		.expect(200);
	expect(resultingEdge.approvedByTarget).toEqual(true);
});

it('lets a Pub manager can destroy a PubEdge', async () => {
	const { anotherPub, anotherPubManager, sourcePub, sourcePubManager } = models;
	const existingEdge = await createPubEdge({
		pubId: sourcePub.id,
		targetPubId: anotherPub.id,
		relationType: 'comment',
		pubIsParent: true,
	});
	const anotherPubAgent = await login(anotherPubManager);
	await anotherPubAgent
		.delete('/api/pubEdges')
		.send({ pubEdgeId: existingEdge.id })
		.expect(403);
	const sourcePubAgent = await login(sourcePubManager);
	await sourcePubAgent
		.delete('/api/pubEdges')
		.send({ pubEdgeId: existingEdge.id })
		.expect(200);
	const edgeNow = await PubEdge.findOne({ where: { id: existingEdge.id } });
	expect(edgeNow).toBeNull();
});
