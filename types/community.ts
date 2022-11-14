import { CommunityNavigationEntry } from 'client/utils/navigation';

import { Collection } from './collection';
import { Pub } from './pub';
import { Page } from './page';

import { ScopeSummary } from './scope';
import { DepositTarget } from './depositTarget';

export type CommunityHeroButton = {
	title: string;
	url: string;
};

export type CommunityHeaderLink = { title: string; url: string; external?: boolean };

export type Community = {
	id: string;
	subdomain: string;
	domain?: string;
	description?: string;
	createdAt: string;
	title: string;
	citeAs?: string;
	publishAs?: string;
	avatar?: string;
	favicon?: string;
	accentColorLight: string;
	accentColorDark: string;
	accentTextColor: string;
	hideCreatePubButton?: boolean;
	headerLogo?: string;
	headerLinks?: CommunityHeaderLink[];
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
	heroPrimaryButton?: CommunityHeroButton;
	heroSecondaryButton?: CommunityHeroButton;
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
	scopeSummaryId: null | string;
	scopeSummary?: ScopeSummary;
	footerLogoLink?: string;
	depositTargets?: DepositTarget[];
};
