export type DepositTarget = {
	id: string;
	communityId: string;
	doiPrefix: string;
	service: 'crossref' | 'datacite';
	username: string;
	password: string;
};
