import { IconName } from 'components';
import * as types from 'types';

type NavBuilderCommunity = Pick<types.Community, 'website' | 'twitter' | 'facebook' | 'email'>;
type NavBuilderPage = Pick<types.Page, 'title' | 'id' | 'isPublic' | 'slug'>;
type NavBuilderCollection = Pick<types.Collection, 'title' | 'id' | 'isPublic' | 'slug'>;

type NavBuildContext = {
	pages: NavBuilderPage[];
	collections: NavBuilderCollection[];
};

type CommunityNavigationMenu = { id: string; title: string; children: CommunityNavigationChild[] };
type CommunityNavigationChild =
	| { id: string; type: 'page' | 'collection' }
	| { id: string; title: string; href: string };

export type CommunityNavigationEntry = CommunityNavigationChild | CommunityNavigationMenu;
export const isCommunityNavigationMenu = (
	item: CommunityNavigationEntry,
): item is CommunityNavigationMenu => typeof item === 'object' && 'children' in item;

type NavbarChild = {
	title: string;
	id: string;
	href: string;
	isPrivate?: true;
	isExternal?: true;
};

export type NavbarMenu = { title: string; id: string; children: NavbarChild[] };
export type NavbarItem = NavbarChild | NavbarMenu;
export const isNavbarMenu = (item: NavbarItem): item is NavbarMenu => 'children' in item;

export const defaultFooterLinks: CommunityNavigationEntry[] = [
	{ id: 'rss', title: 'RSS', href: '/rss.xml' },
	{ id: 'legal', title: 'Legal', href: '/legal' },
];

export type SocialItem = {
	id: string;
	icon: IconName;
	title: string;
	value: string;
	url: string;
};

export const createSocialNavItems = (communityData: NavBuilderCommunity): SocialItem[] => {
	const possibleItems = [
		{
			id: 'si-0',
			icon: 'globe' as const,
			title: 'Website',
			value: communityData.website,
			url: communityData.website,
		},
		{
			id: 'si-1',
			icon: 'twitter' as const,
			title: 'Twitter',
			value: communityData.twitter,
			url: `https://twitter.com/${communityData.twitter}`,
		},
		{
			id: 'si-2',
			icon: 'facebook' as const,
			title: 'Facebook',
			value: communityData.facebook,
			url: `https://facebook.com/${communityData.facebook}`,
		},
		{
			id: 'si-3',
			icon: 'envelope' as const,
			title: 'Contact',
			value: communityData.email,
			url: `mailto:${communityData.email}`,
		},
	];
	return possibleItems.filter((item) => !!item.value) as SocialItem[];
};

const getNavbarChildForPageOrCollection = (
	item: NavBuilderPage | NavBuilderCollection,
): NavbarChild => {
	return {
		title: item.title,
		href: `/${item.slug}`,
		id: item.id,
		...(!item.isPublic && { isPrivate: true }),
	};
};

const getNavbarItemForCommunityNavigationChild = (
	navEntry: CommunityNavigationChild,
	ctx: NavBuildContext,
): null | NavbarChild => {
	const { pages, collections } = ctx;
	if ('type' in navEntry) {
		const { type, id } = navEntry;
		const item =
			type === 'collection'
				? collections.find((c) => c.id === id)
				: pages.find((p) => p.id === id);
		if (item) {
			return getNavbarChildForPageOrCollection(item);
		}
	} else if ('href' in navEntry) {
		const { title, href, id } = navEntry;
		const isExternal = !href.startsWith('/');
		return {
			title,
			href,
			id,
			...(isExternal && { isExternal: true }),
		};
	}
	return null;
};

const getNavbarItemForCommunityNavigationEntry = (
	navEntry: CommunityNavigationEntry,
	ctx: NavBuildContext,
): null | NavbarItem => {
	if (isCommunityNavigationMenu(navEntry)) {
		const { title, children, id } = navEntry;
		return {
			title,
			id,
			children: children
				.map((child) => getNavbarItemForCommunityNavigationChild(child, ctx))
				.filter((x: null | NavbarChild): x is NavbarChild => !!x),
		};
	}
	return getNavbarItemForCommunityNavigationChild(navEntry, ctx);
};

export const getNavItemsForCommunityNavigation = ({
	navigation,
	collections,
	pages,
}: { navigation: CommunityNavigationEntry[] } & NavBuildContext): NavbarItem[] => {
	return navigation
		.map((item) =>
			getNavbarItemForCommunityNavigationEntry(item, {
				collections,
				pages,
			}),
		)
		.filter((x: null | NavbarItem): x is NavbarItem => !!x);
};
