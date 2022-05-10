import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, AnchorButton, Intent } from '@blueprintjs/core';

import {
	GridWrapper,
	Avatar,
	ScopeDropdown,
	MenuButton,
	MenuItem,
	UserNotificationsPopover,
} from 'components';
import { usePageContext } from 'utils/hooks';
import { getResizedUrl } from 'utils/images';
import { apiFetch } from 'client/utils/apiFetch';
import { CommunityHeroButton } from 'types';
import { useViewport } from 'client/utils/useViewport';

require('./header.scss');

type OwnProps = {
	previewContext?: any;
};

const defaultProps = {
	previewContext: undefined,
};

type Props = OwnProps & typeof defaultProps;

const Header = (props: Props) => {
	const { locationData, communityData, loginData, scopeData } = usePageContext(
		props.previewContext,
	);
	const [isLoading, setIsLoading] = useState(false);
	const handleLogout = () => {
		apiFetch('/api/logout').then(() => {
			window.location.href = '/';
		});
	};
	const { viewportWidth } = useViewport();
	const isMobile = viewportWidth! <= 750;
	const handleCreatePub = () => {
		setIsLoading(true);
		return apiFetch
			.post('/api/pubs', { communityId: communityData.id })
			.then((newPub) => {
				window.location.href = `/pub/${newPub.slug}`;
			})
			.catch((err) => {
				console.error(err);
				setIsLoading(false);
			});
	};

	const calculateComponentClasses = (hideHero) => {
		let dynamicComponentClasses = '';

		const isLanding = locationData.path === '/';
		const isBasePubPub = locationData.isBasePubPub;
		const backgroundColorChange =
			communityData.heroBackgroundColor &&
			communityData.accentColorDark !== communityData.heroBackgroundColor;
		const textColorChange =
			communityData.heroTextColor &&
			communityData.accentTextColor !== communityData.heroTextColor;

		if ((!isBasePubPub && !backgroundColorChange) || !isLanding) {
			dynamicComponentClasses += ' accent-background';
		}
		if ((!isBasePubPub && !textColorChange) || (!isBasePubPub && !isLanding)) {
			dynamicComponentClasses += ' accent-color';
		}
		if (isBasePubPub && locationData.path === '/') {
			dynamicComponentClasses += ' bp3-dark';
		}
		if (hideHero) {
			return dynamicComponentClasses;
		}
		const heroTextColor = communityData.heroTextColor || communityData.accentTextColor;
		if (heroTextColor === '#FFFFFF') {
			dynamicComponentClasses += ' bp3-dark';
		}
		return dynamicComponentClasses;
	};

	const calculateMainClasses = (hideHero) => {
		let dynamicMainClasses = 'main';
		if (hideHero) {
			return dynamicMainClasses;
		}
		if (
			!communityData.hideHero &&
			communityData.useHeaderGradient &&
			communityData.heroBackgroundImage
		) {
			dynamicMainClasses += ' gradient bp3-dark';
		}
		return dynamicMainClasses;
	};

	const calculateHeroClasses = (hideHero) => {
		let dynamicHeroClasses = 'hero';
		if (hideHero) {
			return dynamicHeroClasses;
		}
		if (communityData.heroAlign === 'center') {
			dynamicHeroClasses += ' centered';
		}
		return dynamicHeroClasses;
	};

	const calculateBackgroundStyle = (hideHero) => {
		const backgroundStyle = {};
		if (locationData.isBasePubPub) {
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'boxShadow' does not exist on type '{}'.
			backgroundStyle.boxShadow =
				locationData.path === '/'
					? ''
					: '0 0 0 1px rgba(16, 22, 26, 0.1), 0 0 0 rgba(16, 22, 26, 0), 0 1px 1px rgba(16, 22, 26, 0.2)';
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
			backgroundStyle.backgroundColor = locationData.path === '/' ? '' : '#f7f7f9';
		}

		if (hideHero) {
			return backgroundStyle;
		}

		if (communityData.heroBackgroundImage) {
			const resizedBackgroundImage = getResizedUrl(
				communityData.heroBackgroundImage,
				'outside',
				1500,
				600,
			);
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'backgroundImage' does not exist on type ... Remove this comment to see the full error message
			backgroundStyle.backgroundImage = `url("${resizedBackgroundImage}")`;
		}
		const heroBackgroundColor =
			communityData.heroBackgroundColor || communityData.accentColorDark;
		if (heroBackgroundColor) {
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
			backgroundStyle.backgroundColor = communityData.heroBackgroundColor;
		}

		return backgroundStyle;
	};

	const hideHero = locationData.path !== '/' || communityData.hideHero;
	const hideHeaderLogo = !hideHero && communityData.hideHeaderLogo;
	const componentClasses = calculateComponentClasses(hideHero);
	const mainClasses = calculateMainClasses(hideHero);
	const heroClasses = calculateHeroClasses(hideHero);
	const backgroundStyle = calculateBackgroundStyle(hideHero);

	const loggedIn = !!loginData.slug;
	const canManage = scopeData.activePermissions.canManageCommunity;
	const isBasePubPub = locationData.isBasePubPub;

	const resizedHeaderLogo = getResizedUrl(communityData.headerLogo, 'inside', undefined, 50);
	const resizedHeroLogo = getResizedUrl(communityData.heroLogo, 'inside', undefined, 200);
	const resizedHeroImage = getResizedUrl(communityData.heroImage, 'inside', 600);
	const redirectString = `?redirect=${locationData.path}${
		locationData.queryString.length > 1 ? locationData.queryString : ''
	}`;
	const heroPrimaryButton: Partial<CommunityHeroButton> = communityData.heroPrimaryButton || {};
	const heroSecondaryButton: Partial<CommunityHeroButton> =
		communityData.heroSecondaryButton || {};
	const isPreview = !!props.previewContext;

	return (
		<header
			className={classNames([
				'header-component',
				componentClasses,
				isPreview ? 'preview' : '',
			])}
			style={backgroundStyle}
		>
			<div className={mainClasses}>
				<GridWrapper columnClassName="main-content">
					<div className="logo-wrapper">
						{!hideHeaderLogo && (
							<a href="/" aria-label={communityData.title}>
								{communityData.headerLogo && (
									<React.Fragment>
										<img
											alt=""
											style={isBasePubPub ? { padding: '1px 0px' } : {}}
											src={resizedHeaderLogo}
										/>
									</React.Fragment>
								)}
								{!communityData.headerLogo && <span>{communityData.title}</span>}
							</a>
						)}
					</div>
					{viewportWidth && !isMobile ? (
						<div className="buttons-wrapper">
							{isBasePubPub && (
								<React.Fragment>
									<AnchorButton
										href="/explore"
										minimal={true}
										large={true}
										text="Explore"
									/>
									<AnchorButton
										href="/pricing"
										minimal={true}
										large={true}
										text="Pricing"
									/>
									<AnchorButton
										href="/search"
										minimal={true}
										large={true}
										text="Search"
										className="hide-on-mobile"
									/>
									<AnchorButton
										href="/about"
										minimal={true}
										large={true}
										text="About"
									/>
								</React.Fragment>
							)}
							{!isBasePubPub &&
								loggedIn &&
								(!communityData.hideCreatePubButton || canManage) && (
									<Button
										large={true}
										minimal={true}
										text="Create Pub"
										onClick={handleCreatePub}
										loading={isLoading}
									/>
								)}
							{!isBasePubPub && (
								<AnchorButton
									href="/search"
									minimal={true}
									large={true}
									text="Search"
									className="hide-on-mobile"
								/>
							)}
							{!isBasePubPub && (
								<MenuButton
									aria-label="Dashboard Menu"
									placement="bottom-end"
									menuStyle={{ zIndex: 20 }}
									buttonProps={{
										className: 'header-dashboard-button hide-on-mobile',
										minimal: true,
										large: true,
										rightIcon: 'caret-down',
									}}
									buttonContent="Dashboard"
								>
									<ScopeDropdown />
								</MenuButton>
							)}
							{loggedIn && <UserNotificationsPopover />}
							{loggedIn && (
								<MenuButton
									aria-label="User menu"
									placement="bottom-end"
									// The z-index of the PubHeaderFormatting is 19
									menuStyle={{ zIndex: 20 }}
									buttonProps={{
										minimal: true,
										large: true,
									}}
									buttonContent={
										<Avatar
											initials={loginData.initials}
											avatar={loginData.avatar}
											width={30}
										/>
									}
								>
									<MenuItem
										href={`/user/${loginData.slug}`}
										text={
											<React.Fragment>
												{loginData.fullName}
												<span className="subtext" style={{ marginLeft: 4 }}>
													View Profile
												</span>
											</React.Fragment>
										}
									/>
									<MenuItem href="/legal/settings" text="Privacy settings" />
									<MenuItem onClick={handleLogout} text="Logout" />
								</MenuButton>
							)}
							{!loggedIn && (
								<AnchorButton
									large={true}
									minimal={true}
									text="Login or Signup"
									href={`/login${redirectString}`}
								/>
							)}
						</div>
					) : (
						<div className="mobile-header-buttons">
							<div className="bp3-button-group">
								{!isBasePubPub &&
									loggedIn &&
									(!communityData.hideCreatePubButton || canManage) && (
										<AnchorButton
											minimal={true}
											onClick={handleCreatePub}
											loading={isLoading}
											icon="add-to-artifact"
										/>
									)}
								{!isBasePubPub && (
									<AnchorButton href="/search" minimal={true} icon="search" />
								)}
								{!isBasePubPub && (
									<MenuButton
										aria-label="Dashboard Menu"
										placement="bottom-end"
										menuStyle={{ zIndex: 20 }}
										buttonProps={{
											className: 'header-dashboard-button',
											minimal: true,
											icon: 'settings',
										}}
										buttonContent=""
									>
										<ScopeDropdown />
									</MenuButton>
								)}
								{loggedIn && <UserNotificationsPopover />}
								{loggedIn && (
									<MenuButton
										aria-label="User menu"
										placement="bottom-end"
										// The z-index of the PubHeaderFormatting is 19
										menuStyle={{ zIndex: 20 }}
										buttonProps={{
											minimal: true,
										}}
										buttonContent={
											<Avatar
												initials={loginData.initials}
												avatar={loginData.avatar}
												width={20}
											/>
										}
									>
										<MenuItem
											href={`/user/${loginData.slug}`}
											text={
												<React.Fragment>
													{loginData.fullName}
													<span
														className="subtext"
														style={{ marginLeft: 4 }}
													>
														View Profile
													</span>
												</React.Fragment>
											}
										/>
										<MenuItem href="/legal/settings" text="Privacy settings" />
										<MenuItem onClick={handleLogout} text="Logout" />
									</MenuButton>
								)}
								{!loggedIn && (
									<AnchorButton
										minimal={true}
										text="Login or Signup"
										href={`/login${redirectString}`}
									/>
								)}
							</div>
						</div>
					)}
				</GridWrapper>
			</div>
			{!hideHero && (
				<div className={heroClasses}>
					<GridWrapper columnClassName="hero-content">
						<div className="hero-copy">
							{communityData.heroLogo && (
								<div className="hero-logo">
									<img alt={communityData.title} src={resizedHeroLogo} />
								</div>
							)}
							{communityData.heroTitle && (
								<div className="hero-title">{communityData.heroTitle}</div>
							)}
							{communityData.heroText && (
								<div className="hero-text">{communityData.heroText}</div>
							)}
							<div className="hero-button">
								{heroPrimaryButton.title && (
									<AnchorButton
										intent={Intent.PRIMARY}
										large={true}
										text={heroPrimaryButton.title}
										href={heroPrimaryButton.url}
									/>
								)}
								{heroSecondaryButton.title && (
									<AnchorButton
										large={true}
										minimal={true}
										text={heroSecondaryButton.title}
										href={heroSecondaryButton.url}
									/>
								)}
							</div>
						</div>
						{communityData.heroImage && (
							<div className="hero-image">
								<img alt="Community banner" src={resizedHeroImage} />
							</div>
						)}
					</GridWrapper>
				</div>
			)}
		</header>
	);
};
Header.defaultProps = defaultProps;
export default Header;
