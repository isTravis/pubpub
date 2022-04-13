import { Collection, Community, Scope, DefinitelyHas, Member, MemberPermission, Pub } from 'types';

export type LoginData = {
	id: string | null;
	initials?: string;
	slug?: string;
	fullName?: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	title?: string;
	gdprConsent?: string;
};

export type LocationData = {
	hostname: string;
	path: string;
	params: { [k: string]: string };
	query: { [k: string]: string };
	queryString: string;
	isBasePubPub: boolean;
	isProd: boolean;
	isDuqDuq: boolean;
	isQubQub: boolean;
	appCommit: string;
};

export type ScopeData = {
	activePermissions: {
		activePermission: MemberPermission;
		canAdmin: boolean;
		canAdminCommunity: boolean;
		canCreateDiscussions: boolean;
		canCreateReviews: boolean;
		canEdit: boolean;
		canEditDraft: boolean;
		canManage: boolean;
		canManageCommunity: boolean;
		canView: boolean;
		canViewDraft: boolean;
		isSuperAdmin: boolean;
	};
	elements: {
		activeIds: {
			communityId: string;
			collectionId?: string;
			pubId?: string;
		};
		activeTarget: Community | Collection | Pub;
		activeTargetType: 'organization' | 'community' | 'collection' | 'pub';
		activeTargetName: string;
		activeCommunity: Community;
		activeCollection?: Collection;
		activePub?: Pub;
		inactiveCollections?: Collection[];
	};
	activeCounts: {
		reviews: number;
		submissions: number;
	};
	scope: Scope;
	memberData: Member[];
};

export type InitialCommunityData = DefinitelyHas<
	Community,
	'collections' | 'pages' | 'scopeSummary'
>;

export type InitialNotificationsData = {
	hasNotifications: boolean;
	hasUnreadNotifications: boolean;
};

export type InitialData = {
	scopeData: ScopeData;
	locationData: LocationData;
	loginData: LoginData;
	communityData: InitialCommunityData;
	featureFlags: Record<string, boolean>;
	initialNotificationsData: InitialNotificationsData;
};
