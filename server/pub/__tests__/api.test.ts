/* eslint-disable no-restricted-syntax, no-await-in-loop */
import uuid from 'uuid/v4';

import { pubSchema } from 'utils/api/schemas/pub';
import { setup, teardown, login, modelize, expectCreatedActivityItem } from 'stubstub';
import { CollectionPub, Pub, Draft } from 'server/models';
import { issueCreatePubToken } from '../tokens';

const defaultCollectionId = uuid();

const models = modelize`
	Community community {
		defaultPubCollections: ${[defaultCollectionId]}
		hideCreatePubButton: true
        Member {
            permissions: "manage"
            User communityManager {}
        }
        Member {
            permissions: "edit"
            User communityMember {}
        }
		Member {
			permissions: "admin"
			User admin {}
		}
		Collection collection {
            Member {
                permissions: "manage"
                User collectionManager {}
            }
            CollectionPub {
                rank: "h"
                Pub pub {
                    Member {
                        permissions: "admin"
                        User pubAdmin {}
                    }
                    Member {
                        permissions: "manage"
                        User pubManager {}
                    }
                }
            }
        }
		Pub wowPub {
			slug: "wow"
			title: "Wow, a pub"
			doi: "10.21428/wow"
		}
		Pub ewPub {
			slug: "xxx"
			title: "Ew, another pub"
			doi: "10.21428/ew"
			PubAttribution schmoeAttribution {
				name: "John Schmoe"
			}
		}
        Collection defaultCollection {
            id: ${defaultCollectionId}
		}
		Collection c1 {}
		Collection c2 {}
        Pub destroyThisPub {
            Member {
                permissions: "manage"
                User destructivePubManager {}
            }
            Member {
                permissions: "edit"
                User angryPubEditor {}
            }
        }
        Pub alsoDestroyThisPub {}
    }
    Community nefariousCommunity {
        Collection nefariousCollection {
            Member {
                permissions: "manage"
                User nefariousUser {}
            }
		}
		Member {
			permissions: "admin"
			User nefariousAdmin {}
		}
	}
	Community permissiveCommunity {}
	User randomUser {}
	User anotherRandomUser {}
`;

setup(beforeAll, async () => {
	await models.resolve();
});

teardown(afterAll);

describe('/api/pubs', () => {
	it('does not allow logged-out visitors to create a Pub', async () => {
		const { community } = models;
		const agent = await login();
		await agent.post('/api/pubs').send({ communityId: community.id }).expect(403);
	});

	it('does not allow random users to create a Pub', async () => {
		const { community, randomUser } = models;
		const agent = await login(randomUser);
		await agent.post('/api/pubs').send({ communityId: community.id }).expect(403);
	});

	it('lets random users create a Pub in communities with hideCreatePubButton=false', async () => {
		const { permissiveCommunity, randomUser } = models;
		const agent = await login(randomUser);
		await agent.post('/api/pubs').send({ communityId: permissiveCommunity.id }).expect(201);
	});

	it('lets random users create a Pub with a valid createPub token', async () => {
		const { community, randomUser, c1, c2, defaultCollection } = models;
		const token = issueCreatePubToken({
			userId: randomUser.id,
			communityId: community.id,
			createInCollectionIds: [c1.id, c2.id],
		});
		const agent = await login(randomUser);
		const { body: pub } = await agent
			.post('/api/pubs')
			.send({
				communityId: community.id,
				createPubToken: token,
			})
			.expect(201);
		const collectionPubs = await CollectionPub.findAll({ where: { pubId: pub.id } });
		expect(collectionPubs.map((cp) => cp.collectionId).sort()).toEqual(
			[c1.id, c2.id, defaultCollection.id].sort(),
		);
	});

	it('does not accept createPub tokens from other users or communities', async () => {
		const { community, nefariousCommunity, randomUser, anotherRandomUser } = models;
		const token = issueCreatePubToken({
			userId: randomUser.id,
			communityId: nefariousCommunity.id,
			createInCollectionIds: [],
		});
		const agent = await login(randomUser);
		await agent
			.post('/api/pubs')
			.send({
				communityId: community.id,
				createPubToken: token,
			})
			.expect(403);
		const anotherAgent = await login(anotherRandomUser);
		await anotherAgent
			.post('/api/pubs')
			.send({
				communityId: nefariousCommunity.id,
				createPubToken: token,
			})
			.expect(403);
	});

	it('does not allow Members with insufficient permissions to create a Pub', async () => {
		const { community, communityMember } = models;
		const agent = await login(communityMember);
		await agent.post('/api/pubs').send({ communityId: community.id }).expect(403);
	});

	it('does not allow Members from other Communities to create a Pub', async () => {
		const { community, nefariousCollection, nefariousUser } = models;
		const agent = await login(nefariousUser);
		await agent
			.post('/api/pubs')
			.send({ communityId: community.id, collectionId: nefariousCollection.id })
			.expect(403);
	});

	it('allows a Community manager to create a Pub (and adds it to Community default Collection, creates a Draft)', async () => {
		const { community, communityManager } = models;
		const agent = await login(communityManager);
		const { body: pub } = await expectCreatedActivityItem(
			agent.post('/api/pubs').send({ communityId: community.id }).expect(201),
		).toMatchResultingObject((response) => ({
			kind: 'pub-created',
			pubId: response.body.id,
			actorId: communityManager.id,
		}));
		const collectionPub = await CollectionPub.findOne({
			where: {
				pubId: pub.id,
				collectionId: defaultCollectionId,
			},
		});
		expect(collectionPub).toBeTruthy();
		const draft = await Draft.findOne({ where: { id: pub.draftId } });
		expect(draft).toBeTruthy();
	});

	it('allows a Collection manager to create a Pub (and adds it to the Collection)', async () => {
		const { community, collection, collectionManager } = models;
		const agent = await login(collectionManager);
		const { body: pub } = await agent
			.post('/api/pubs')
			.send({ communityId: community.id, collectionId: collection.id })
			.expect(201);
		const collectionPub = await CollectionPub.findOne({
			where: {
				pubId: pub.id,
				collectionId: collection.id,
			},
		});
		expect(collectionPub).toBeTruthy();
	});

	it('forbids a user without permissions from updating a Pub', async () => {
		const { pub, nefariousUser } = models;
		const agent = await login(nefariousUser);
		await agent.put('/api/pubs').send({ pubId: pub.id, title: 'Bwa ha ha' }).expect(403);
	});

	it('creates an ActivityItem when a Pub is updated', async () => {
		const { pub, pubManager } = models;
		const agent = await login(pubManager);
		const title = `${pubManager.id} was here!`;
		await expectCreatedActivityItem(
			agent.put('/api/pubs').send({ pubId: pub.id, title, doi: 'some_doi' }).expect(200),
		).toMatchObject({
			kind: 'pub-updated',
			pubId: pub.id,
			actorId: pubManager.id,
			payload: {
				title: { from: pub.title, to: title },
			},
		});
	});

	it('allows a Community, Collection, Pub manager to update some fields on a Pub (but not others)', async () => {
		const { pub, pubManager, collectionManager, communityManager } = models;
		for (const user of [pubManager, collectionManager, communityManager]) {
			const agent = await login(user);
			const title = `${user.id} was here!`;
			await agent
				.put('/api/pubs')
				.send({ pubId: pub.id, title, doi: 'some_doi' })
				.expect(200);
			const pubNow = await Pub.findOne({ where: { id: pub.id } });
			expect(pubNow).toMatchObject({ title, doi: null });
		}
	});

	it('allows a Pub admin to set a DOI on a Pub', async () => {
		const { pub, pubAdmin } = models;
		const agent = await login(pubAdmin);
		await expectCreatedActivityItem(
			agent.put('/api/pubs').send({ pubId: pub.id, doi: 'some_doi' }).expect(200),
		).toMatchObject({
			kind: 'pub-updated',
			pubId: pub.id,
			actorId: pubAdmin.id,
			payload: { doi: { from: null, to: 'some_doi' } },
		});
		const pubNow = await Pub.findOne({ where: { id: pub.id } });
		expect(pubNow).toMatchObject({ doi: 'some_doi' });
	});

	it('forbids a user without permissions from deleting a Pub', async () => {
		const { pub, nefariousUser } = models;
		const agent = await login(nefariousUser);
		await agent.delete('/api/pubs').send({ pubId: pub.id }).expect(403);
	}, 10000);

	it('forbids a Member without sufficient permissions from deleting a Pub', async () => {
		const { destroyThisPub, angryPubEditor } = models;
		const agent = await login(angryPubEditor);
		await agent.delete('/api/pubs').send({ pubId: destroyThisPub.id }).expect(403);
	});

	it('allows a Pub manager to delete a Pub', async () => {
		const { destroyThisPub, destructivePubManager } = models;
		const agent = await login(destructivePubManager);
		await expectCreatedActivityItem(
			agent.delete('/api/pubs').send({ pubId: destroyThisPub.id }).expect(200),
		).toMatchObject({
			kind: 'pub-removed',
			pubId: destroyThisPub.id,
			actorId: destructivePubManager.id,
		});
	});

	it('allows a Community manager to delete a Pub', async () => {
		const { alsoDestroyThisPub, communityManager } = models;
		const agent = await login(communityManager);
		await agent.delete('/api/pubs').send({ pubId: alsoDestroyThisPub.id }).expect(200);
	});
});

const getHost = (community: any) => `${community.subdomain}.pubpub.org`;

let adminAgent: Awaited<ReturnType<typeof login>>;

describe('GET /api/pubs', () => {
	beforeEach(async () => {
		adminAgent = await login(models.admin);
		adminAgent.set('Host', getHost(models.community));
	});

	it('should get a pub by id', async () => {
		const { wowPub } = models;

		const { body } = await adminAgent.get(`/api/pubs/${wowPub.id}`).expect(200);

		expect(body.title).toEqual(wowPub.title);
	});

	it('should be able to include the community in the get response, but not do so by default', async () => {
		const { wowPub, community } = models;

		const { body } = await adminAgent.get(`/api/pubs/${wowPub.id}`).expect(200);

		expect(body.community).toBeUndefined();

		const { body: bodyWithCommunity } = await adminAgent
			.get(`/api/pubs/${wowPub.id}?include=${JSON.stringify(['community'])}`)
			.expect(200);

		expect(bodyWithCommunity.community).toBeDefined();
		expect(bodyWithCommunity.community.id).toEqual(community.id);
	});

	it('should throw a ForbiddenError for non-admin users', async () => {
		const { communityMember } = models;
		const agent = await login(communityMember);

		await agent.get('/api/pubs').set('Host', getHost(models.community)).expect(403); // Forbidden
	});

	it('should only return pubs from your community', async () => {
		const { nefariousAdmin, nefariousCommunity } = models;
		const agent = await login(nefariousAdmin);

		const { body } = await agent
			.get('/api/pubs')
			.set('Host', getHost(nefariousCommunity))
			.expect(200);

		expect(body).toBeInstanceOf(Array);
		expect(body.length).toEqual(0);
	});

	it('should return pubs with default query parameters', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const { body } = await agent.get('/api/pubs').set('Host', getHost(community)).expect(200);

		expect(body).toBeInstanceOf(Array);
		expect(body.length).toBeLessThanOrEqual(10); // default limit
		expect(body.length).toBeGreaterThanOrEqual(1);
		// Additional assertions based on default sort, order, etc.
	});

	it('should return pubs with custom query parameters', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const { body } = await agent
			.get('/api/pubs?limit=5&offset=5&sortBy=updatedAt&orderBy=ASC')
			.set('Host', getHost(community))
			.expect(200);

		expect(body).toBeInstanceOf(Array);
		expect(body.length).toBeLessThanOrEqual(5);
		// Additional assertions based on custom sort, order, etc.
	});

	it('should return pubs with a specific title', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const { body } = await agent
			.get(
				`/api/pubs?filter=${encodeURIComponent(
					JSON.stringify({ title: { contains: 'Wow' } }),
				)}`,
			)
			.set('Host', getHost(community))
			.expect(200);

		expect(body).toBeInstanceOf(Array);
		expect(body.length).toBeGreaterThanOrEqual(1);
		body.forEach((pub) => {
			expect(pub.title).toBe('Wow, a pub');
		});
	});
	it('should return pubs with specified includes', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const { body } = await agent
			.get('/api/pubs?include[]=attributions&include[]=members')
			.set('Host', getHost(community))
			.expect(200);

		expect(body).toBeInstanceOf(Array);
		expect(body.length).toBeGreaterThanOrEqual(1);
		body.forEach((pub) => {
			expect(pub).toHaveProperty('attributions');
			expect(pub).toHaveProperty('members');
			expect(pub).not.toHaveProperty('pubs');
			expect(pub).not.toHaveProperty('page');
		});

		const ew = body.find((pub) => pub.title === 'Ew, another pub');

		expect(ew).toHaveProperty('attributions');

		const schmoe = ew?.attributions.find((attribution) => attribution.name === 'John Schmoe');
		expect(schmoe.name).toBe('John Schmoe');
	});
	it('should return pubs that match the expected schema', async () => {
		const { body } = await adminAgent.get('/api/pubs').expect(200);

		body.forEach((pub) => {
			expect(() => pubSchema.parse(pub)).not.toThrow();
		});
	});

	it('should order pubs differently for different sort parameters', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const { body: orderByTitle } = await agent
			.get('/api/pubs?sort=slug')
			.set('Host', getHost(community))
			.expect(200);

		const { body: orderBySlug } = await agent
			.get('/api/pubs?sort=title')
			.set('Host', getHost(community))
			.expect(200);

		// Assuming IDs are unique and can be used to differentiate pubs
		expect(orderByTitle[0].id).not.toEqual(orderBySlug[0].id);
	});

	it('should reverse the order of pubs when changing sort order', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const [{ body: orderAsc }, { body: orderDesc }] = await Promise.all([
			agent
				.get('/api/pubs?sort=slug&orderBy=ASC&limit=100')
				.set('Host', getHost(community))
				.expect(200),

			agent
				.get('/api/pubs?sort=slug&orderBy=DESC&limit=100')
				.set('Host', getHost(community))
				.expect(200),
		]);

		expect(orderAsc.length).toEqual(orderDesc.length);
		expect(orderAsc.at(0)).toEqual(orderDesc.at(-1));
		expect(orderAsc.at(1)).toEqual(orderDesc.at(-2));
	});

	it('should limit the number of pubs returned', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const limit = 5;

		const { body } = await agent
			.get(`/api/pubs?limit=${limit}`)
			.set('Host', getHost(community))
			.expect(200);

		expect(body.length).toEqual(limit);
	});

	it('should return correct pubs with offset and limit', async () => {
		const { admin, community } = models;
		const agent = await login(admin);

		const limit = 5;
		const offset = 5;

		const { body: firstPage } = await agent
			.get(`/api/pubs?limit=${limit}&offset=${offset}`)
			.set('Host', getHost(community))
			.expect(200);

		const { body: secondPage } = await agent
			.get(`/api/pubs?limit=${limit}&offset=${offset + limit}`)
			.set('Host', getHost(community))
			.expect(200);

		// Ensure no overlap in pubs between pages
		const firstPageIds = firstPage.map((c) => c.id);
		const secondPageIds = secondPage.map((c) => c.id);
		const intersection = firstPageIds.filter((id) => secondPageIds.includes(id));

		expect(intersection.length).toEqual(0);
	});

	it('should do some sophisticated filtering', async () => {
		const { admin, community } = models;

		const agent = await login(admin);

		const filter = {
			title: [[{ contains: 'pub' }, { contains: 'Wow', not: true }]],
			doi: [{ contains: '10.21428' }],
		};

		const { body } = await agent
			.get(`/api/pubs?filter=${encodeURIComponent(JSON.stringify(filter))}`)
			.set('Host', getHost(community))
			.expect(200);

		expect(body.length).toEqual(1);
		expect(body[0]?.doi).toMatch(/10.21428\/ew.*/);
	});

	it('should be able to combine inverted and normal filters seamlessly', async () => {
		const { admin, community } = models;

		const agent = await login(admin);

		const filter = {
			title: [
				[
					{ contains: 'pub' },
					{
						contains: 'ew',
						not: true,
					},
				],
			],
		};

		const { body } = await agent
			.get(`/api/pubs?filter=${encodeURIComponent(JSON.stringify(filter))}`)
			.set('Host', getHost(community))
			.expect(200);

		body.forEach((pub) => {
			expect(pub.title).not.toBe('Ew, another pub');
		});
	});
});
