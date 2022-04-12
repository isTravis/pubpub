import React from 'react';
import classNames from 'classnames';
import Color from 'color';

import { Icon, IconName } from 'components';
import { usePageContext } from 'utils/hooks';
import { getDashUrl, getDashboardModes } from 'utils/dashboard';

import ScopePicker from './ScopePicker';

require('./sideMenu.scss');

type MenuItem = {
	title: string;
	icon: IconName;
	href: string;
	validScopes?: ('organization' | 'community' | 'collection' | 'pub')[];
	manageRequired?: true;
	count?: number;
};

const SideMenu = () => {
	const { locationData, communityData, scopeData, featureFlags } = usePageContext();
	const { activePermissions, activeCounts, elements } = scopeData;
	const { canManage } = activePermissions;
	const { activeTargetType, activeCollection } = elements;
	const collectionSlug = activeCollection && activeCollection.slug;
	const pubSlug = locationData.params.pubSlug;

	const backgroundColor = Color(communityData.accentColorDark).fade(0.95).rgb().string();

	const menuItems: MenuItem[] = [
		{
			title: 'Overview',
			icon: 'home2',
			href: getDashUrl({ collectionSlug, pubSlug }),
		},
		{
			title: 'Activity',
			icon: 'pulse',
			href: getDashUrl({ collectionSlug, pubSlug, mode: 'activity' }),
			manageRequired: true,
		},
		{
			title: 'Pages',
			icon: 'page-layout',
			href: getDashUrl({
				collectionSlug,
				pubSlug,
				mode: 'pages',
			}),
			validScopes: ['community'],
			manageRequired: true,
		},
		{
			title: 'Layout',
			icon: 'page-layout',
			href: getDashUrl({
				collectionSlug,
				mode: 'layout',
			}),
			manageRequired: true,
			validScopes: ['collection'],
		},
		{
			title: 'Reviews',
			icon: 'social-media',
			href: getDashUrl({
				collectionSlug,
				pubSlug,
				mode: 'reviews',
			}),
			count: activeCounts.reviews,
		},
		featureFlags.submissions && {
			title: 'Submissions',
			icon: 'manually-entered-data',
			manageRequired: true,
			validScopes: ['collection'],
			href: getDashUrl({
				collectionSlug,
				mode: 'submissions',
			}),
			count: activeCounts.submissions,
		},
		{
			title: 'Connections',
			icon: 'layout-auto',
			href: getDashUrl({
				collectionSlug,
				pubSlug,
				mode: 'connections',
			}),
			validScopes: ['pub'],
		},
		{
			title: 'Impact',
			icon: 'dashboard',
			href: getDashUrl({
				collectionSlug,
				pubSlug,
				mode: 'impact',
			}),
			validScopes: ['pub', 'community', 'collection'],
		},
		{
			title: 'Members',
			icon: 'people',
			href: getDashUrl({
				collectionSlug,
				pubSlug,
				mode: 'members',
			}),
			manageRequired: true,
		},
		{
			title: 'Settings',
			icon: 'cog',
			href: getDashUrl({
				collectionSlug,
				pubSlug,
				mode: 'settings',
			}),
			manageRequired: true,
		},
	].filter((x) => !!x) as MenuItem[];

	return (
		<div className="side-menu-component">
			<style
				/* eslint-disable-next-line react/no-danger */
				dangerouslySetInnerHTML={{
					__html: `
						.menu.active:before { background: ${communityData.accentColorDark} }
						.side-menu-component { background: ${backgroundColor} }
					`,
				}}
			/>
			<ScopePicker />

			<div className="content">
				{menuItems
					.filter((item) => {
						const { validScopes, manageRequired } = item;
						const scopeIsValid = !validScopes || validScopes.includes(activeTargetType);
						const permissionIsValid = canManage || !manageRequired;
						return scopeIsValid && permissionIsValid;
					})
					.map((item) => {
						const { mode } = getDashboardModes(locationData);
						const itemMode = item.title.toLowerCase().replace(/ /gi, '-');
						const active = mode === itemMode;
						return (
							<div key={item.title} className={classNames({ menu: true, active })}>
								<a href={item.href} className="content-title">
									<Icon className="side-icon" icon={item.icon} />
									<span className="side-text">{item.title}</span>
									{item.count ? <div className="count">{item.count}</div> : null}
								</a>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default SideMenu;
