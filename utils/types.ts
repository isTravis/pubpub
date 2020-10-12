import { LayoutBlock, CollectionLayout } from 'utils/layout/types';
import { CommunityNavigationEntry } from 'client/utils/navigation';

export type PubAttribution = {
	id: string;
	name?: string;
	avatar?: string;
	title?: string;
	order?: number;
	isAuthor?: boolean;
	roles?: {};
	affiliation?: string;
	orcid?: string;
	userId?: string;
};

export type CollectionAttribution = {
	id: string;
	name?: string;
	avatar?: string;
	title?: string;
	order?: number;
	isAuthor?: boolean;
	roles?: {};
	affiliation?: string;
	orcid?: string;
	userId?: string;
};

export type Collection = {
	id: string;
	title: string;
	slug: string;
	avatar?: string;
	isRestricted?: string;
	isPublic?: boolean;
	viewHash?: string;
	editHash?: string;
	metadata?: string;
	kind?: 'tag' | 'issue' | 'book' | 'conference';
	doi?: string;
	readNextPreviewSize: 'none' | 'minimal' | 'medium' | 'choose-best';
	pageId?: string;
	communityId: string;
	attributions?: CollectionAttribution[];
	layout: CollectionLayout;
};

export type CollectionPub = {
	id: string;
	pubId: string;
	collectionId: string;
	contextHint?: string;
	rank: string;
	isPrimary: boolean;
	collection?: Collection;
	pub?: Pub;
};

export type Export = {
	id: string;
	branchId: string;
	format: string;
	url?: string;
	historyKey: string;
	workerTaskId?: string;
};

export type Member = {
	id?: string;
	permissions: 'view' | 'edit' | 'manage' | 'admin';
	isOwner?: boolean;
	userId: string;
	pubId?: string;
	collectionId?: string;
	communityId?: string;
	organizationId?: string;
};

export type Branch = {
	id: string;
	shortId: string;
	title?: string;
	description?: string;
	submissionAlias?: string;
	order?: number;
	viewHash?: string;
	discussHash?: string;
	editHash?: string;
	firstKeyAt?: string;
	latestKeyAt?: string;
	pubId: string;
	maintenanceDocId?: string;
};

export type Release = {
	id: string;
	noteContent?: {};
	noteText?: string;
	branchKey: number;
	pubId: string;
	branchId: string;
	userId: string;
	sourceBranchId: string;
	sourceBranchKey: number;
};

export type PubVersion = {
	id: string;
	historyKey?: number;
	branchId?: string;
	pubId?: string;
};

export type ExternalPublication = {
	title: string;
	url: string;
	contributors?: string[];
	doi?: string;
	description?: string;
	avatar?: string;
	publicationDate?: string;
};

export type PubEdge = {
	id: string;
	pubId: string;
	externalPublicationId?: number;
	targetPubId?: string;
	relationType: string;
	rank: string;
	pubIsParent: boolean;
	approvedByTarget: boolean;
	externalPublication?: ExternalPublication;
	targetPub?: Pub;
	pub?: Pub;
};

type OutboundEdge = Omit<PubEdge, 'pub'>;
type InboundEdge = Omit<PubEdge, 'targetPub'>;

export type CrossrefDepositRecord = {
	id: string;
	depositJson?: {};
};

export type Pub = {
	createdAt: string;
	id: string;
	slug: string;
	title: string;
	description?: string;
	avatar?: string;
	headerStyle: 'white-blocks' | 'black-blocks' | 'dark' | 'light';
	headerBackgroundColor?: string;
	headerBackgroundImage?: string;
	firstPublishedAt?: string;
	lastPublishedAt?: string;
	customPublishedAt?: string;
	doi?: string;
	labels?: string;
	downloads?: any[];
	metadata?: {};
	licenseSlug?: string;
	citationStyle?: string;
	citationInlineStyle?: string;
	viewHash?: string;
	editHash?: string;
	communityId: string;
	attributions?: PubAttribution[];
	collectionPubs?: CollectionPub[];
	exports?: Export[];
	members?: Member[];
	branches?: Branch[];
	releases?: Release[];
	pubVersions?: PubVersion[];
	crossrefDepositRecord?: CrossrefDepositRecord;
	inboundEdges?: InboundEdge[];
	outboundEdges?: OutboundEdge[];
};

export type Page = {
	id: string;
	title: string;
	slug: string;
	description?: string;
	avatar?: string;
	isPublic: boolean;
	isNarrowWidth?: boolean;
	viewHash?: string;
	layout: LayoutBlock[];
};

export type Community = {
	id: string;
	subdomain: string;
	domain?: string;
	createdAt: string;
	title: string;
	avatar?: string;
	favicon?: string;
	accentColorLight?: string;
	accentColorDark?: string;
	hideCreatePubButton?: boolean;
	headerLogo?: string;
	headerLinks?: string;
	headerColorType?: 'light' | 'dark' | 'custom';
	useHeaderTextAccent?: boolean;
	hideHero?: boolean;
	hideHeaderLogo?: boolean;
	heroLogo?: string;
	heroBackgroundImage?: string;
	heroBackgroundColor?: string;
	heroTextColor?: string;
	useHeaderGradient?: boolean;
	heroImage?: string;
	heroTitle?: string;
	heroText?: string;
	heroPrimaryButton?: {};
	heroSecondaryButton?: {};
	heroAlign?: string;
	navigation: CommunityNavigationEntry[];
	hideNav?: boolean;
	footerLinks?: CommunityNavigationEntry[];
	footerTitle?: string;
	footerImage?: string;
	website?: string;
	facebook?: string;
	twitter?: string;
	email?: string;
	issn?: string;
	isFeatured?: boolean;
	viewHash?: string;
	editHash?: string;
	premiumLicenseFlag?: boolean;
	defaultPubCollections: string[];
	organizationId?: string;
	collections?: Collection[];
	pages?: Page[];
	pubs?: Pub[];
};
