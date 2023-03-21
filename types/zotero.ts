export type ZoteroIntegration = {
	id: string;
	userId: string;
	externalUsername: string;
	externalUserId: string;
	integrationDataOAuth1Id: string;
};

export type ZoteroCSLJSON = {
	structured: string;
	key: string;
	citation: string;
};

export type StructuredZoteroCSLJSON = ZoteroCSLJSON & { bibtex: string };
