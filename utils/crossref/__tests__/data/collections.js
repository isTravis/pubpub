import attributions from './attributions';

export const book = {
	id: 'c489f75c-88b4-46cc-8547-95f7366132a5',
	title: 'My new book full of pubs',
	isPublic: true,
	pageId: null,
	communityId: 'eea8ec7d-6ba0-4c31-98bd-1da69b5d2141',
	metadata: {
		doi: 'an_utterly_fake_doi',
		url: 'https://test.com',
		isbn: 'this_is_an_isbn',
		edition: '3',
		copyrightYear: '2014',
		publicationDate: '2015-03-02',
	},
	kind: 'book',
	doi: 'an_utterly_fake_doi',
	createdAt: '2019-04-10T23:59:57.943Z',
	updatedAt: '2019-04-11T18:00:56.307Z',
	attributions: attributions,
	collectionPubs: [],
};

export const issue = {
	id: 'e281f63f-02df-4153-9b7d-e5fe1386b0e3',
	title: 'Another Great Issue',
	isPublic: false,
	pageId: null,
	communityId: 'eea8ec7d-6ba0-4c31-98bd-1da69b5d2141',
	metadata: {
		doi: '10.21428/eea8ec7d.e281f63f',
		url: 'https://dev.pubpub.org/collection/e281f63f',
		issue: '5',
		volume: '2',
		printIssn: 'this_is_a_print_issn',
		electronicIssn: 'this_is_an_electronic_issn_lol',
		publicationDate: '2017-03-25',
		printPublicationDate: '2017-04-05',
	},
	kind: 'issue',
	doi: '10.21428/eea8ec7d.e281f63f',
	createdAt: '2019-03-25T19:45:20.221Z',
	updatedAt: '2019-04-11T18:05:45.483Z',
	attributions: attributions,
	collectionPubs: [],
};

export const conference = {
	id: '4c3a0515-bbc4-4f5d-b62e-0e903bee4c33',
	title: 'This Conference Is Happening Again',
	isPublic: true,
	pageId: null,
	communityId: 'eea8ec7d-6ba0-4c31-98bd-1da69b5d2141',
	metadata: {
		url: 'https://dev.pubpub.org/collection/4c3a0515',
		date: '2019-05-01',
		theme: "We love conferences don't we",
		acronym: 'TCIHA',
		location: 'Kalamazoo, MI',
	},
	kind: 'conference',
	doi: 'yes_it_is_a_conference_doi',
	createdAt: '2019-04-11T18:10:54.634Z',
	updatedAt: '2019-04-11T18:11:23.352Z',
	attributions: attributions,
	collectionPubs: [],
};
