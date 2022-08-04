import React from 'react';
import classNames from 'classnames';

import { getDashUrl } from 'utils/dashboard';
import { usePageContext } from 'utils/hooks';
import { isDevelopment } from 'utils/environment';
import { pubPubIcons } from 'client/utils/icons';
import { Avatar, Icon, IconName, MenuItem, DevCommunitySwitcherMenuItems } from 'components';

import { MenuItemDivider } from '../Menu';

require('./scopeDropdown.scss');

type Scope = {
	type: string;
	icon: IconName;
	iconSize?: number;
	title: string;
	avatar: undefined | string;
	href: string;
};

type Props = {
	isDashboard?: boolean;
};

const ScopeDropdown = (props: Props) => {
	const { isDashboard } = props;
	const { locationData, communityData, scopeData, pageData } = usePageContext();
	const { activeCollection, activePub } = scopeData.elements;
	const { canManageCommunity } = scopeData.activePermissions;
	const collectionSlug = locationData.params.collectionSlug || locationData.query.collectionSlug;
	const pubSlug = locationData.params.pubSlug;

	const scopes: Scope[] = [];
	scopes.push({
		type: 'Community',
		icon: 'office',
		title: communityData.title,
		avatar: communityData.avatar,
		href: getDashUrl({}),
	});
	if (pageData && canManageCommunity && !isDashboard) {
		scopes.push({
			type: 'Page',
			icon: 'page-layout',
			iconSize: 12,
			title: pageData.title,
			avatar: pageData.avatar,
			href: getDashUrl({ mode: 'pages', subMode: pageData.slug || 'home' }),
		});
	}
	if (activeCollection) {
		scopes.push({
			type: 'Collection',
			icon: 'collection',
			title: activeCollection.title,
			avatar: activeCollection.avatar,
			href: getDashUrl({
				collectionSlug,
			}),
		});
	}
	if (activePub) {
		scopes.push({
			type: 'Pub',
			icon: 'pubDoc',
			title: activePub.title,
			avatar: activePub.avatar,
			href: getDashUrl({
				collectionSlug,
				pubSlug,
			}),
		});
	}

	return (
		<div className={classNames('scope-dropdown-component', isDashboard && 'in-dashboard')}>
			{isDashboard && <div className="intro">Select Scope:</div>}
			<div className="scopes">
				{isDevelopment() && (
					<>
						<MenuItem text="Switch Community..." icon={pubPubIcons.community}>
							<DevCommunitySwitcherMenuItems />
						</MenuItem>
						<MenuItemDivider />
					</>
				)}
				{scopes.map((scope, index) => {
					return (
						<MenuItem
							href={scope.href}
							key={scope.type}
							text={
								<div className={`scope-item item-${index}`}>
									<div className="top">
										<Icon icon={scope.icon} iconSize={scope.iconSize || 10} />
										{scope.type}
									</div>
									<div className="bottom">
										<Avatar
											avatar={scope.avatar}
											initials={scope.title[0]}
											width={18}
											isBlock={true}
										/>
										{scope.title}
									</div>
								</div>
							}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default ScopeDropdown;
