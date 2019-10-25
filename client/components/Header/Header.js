import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	Popover,
	PopoverInteractionKind,
	Position,
	Menu,
	MenuItem,
	MenuDivider,
	Button,
	AnchorButton,
	Intent,
} from '@blueprintjs/core';
import { GridWrapper } from 'components';
import Avatar from 'components/Avatar/Avatar';
import DropdownButton from 'components/DropdownButton/DropdownButton';
import { apiFetch, getResizedUrl } from 'utils';

require('./header.scss');

const propTypes = {
	communityData: PropTypes.object.isRequired,
	locationData: PropTypes.object.isRequired,
	loginData: PropTypes.object.isRequired,
};

class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		};
		this.handleLogout = this.handleLogout.bind(this);
		this.handleCreatePub = this.handleCreatePub.bind(this);
		this.calculateComponentClasses = this.calculateComponentClasses.bind(this);
		this.calculateMainClasses = this.calculateMainClasses.bind(this);
		this.calculateHeroClasses = this.calculateHeroClasses.bind(this);
		this.calculateBackgroundStyle = this.calculateBackgroundStyle.bind(this);
	}

	handleLogout() {
		apiFetch('/api/logout').then(() => {
			window.location.href = '/';
		});
	}

	handleCreatePub() {
		this.setState({ isLoading: true });
		return apiFetch('/api/pubs', {
			method: 'POST',
			body: JSON.stringify({
				communityId: this.props.communityData.id,
				defaultCollectionIds: this.props.communityData.defaultPubCollections || [],
			}),
		})
			.then((newPub) => {
				window.location.href = `/pub/${newPub.slug}`;
			})
			.catch((err) => {
				console.error(err);
				this.setState({ isLoading: false });
			});
	}

	calculateComponentClasses(hideHero) {
		let dynamicComponentClasses = '';

		const isLanding = this.props.locationData.path === '/';
		const isBasePubPub = this.props.locationData.isBasePubPub;
		const backgroundColorChange =
			this.props.communityData.heroBackgroundColor &&
			this.props.communityData.accentColorDark !==
				this.props.communityData.heroBackgroundColor;
		const textColorChange =
			this.props.communityData.heroTextColor &&
			this.props.communityData.accentTextColor !== this.props.communityData.heroTextColor;

		if ((!isBasePubPub && !backgroundColorChange) || !isLanding) {
			dynamicComponentClasses += ' accent-background';
		}
		if ((!isBasePubPub && !textColorChange) || (!isBasePubPub && !isLanding)) {
			dynamicComponentClasses += ' accent-color';
		}
		if (isBasePubPub && this.props.locationData.path === '/') {
			dynamicComponentClasses += ' bp3-dark';
		}
		if (hideHero) {
			return dynamicComponentClasses;
		}
		const heroTextColor =
			this.props.communityData.heroTextColor || this.props.communityData.accentTextColor;
		if (heroTextColor === '#FFFFFF') {
			dynamicComponentClasses += ' bp3-dark';
		}
		return dynamicComponentClasses;
	}

	calculateMainClasses(hideHero) {
		let dynamicMainClasses = 'main';
		if (hideHero) {
			return dynamicMainClasses;
		}
		if (
			!this.props.communityData.hideHero &&
			this.props.communityData.useHeaderGradient &&
			this.props.communityData.heroBackgroundImage
		) {
			dynamicMainClasses += ' gradient bp3-dark';
		}
		return dynamicMainClasses;
	}

	calculateHeroClasses(hideHero) {
		let dynamicHeroClasses = 'hero';
		if (hideHero) {
			return dynamicHeroClasses;
		}
		if (this.props.communityData.heroAlign === 'center') {
			dynamicHeroClasses += ' centered';
		}
		return dynamicHeroClasses;
	}

	calculateBackgroundStyle(hideHero) {
		const backgroundStyle = {};
		if (this.props.locationData.isBasePubPub) {
			backgroundStyle.boxShadow =
				this.props.locationData.path === '/'
					? ''
					: '0 0 0 1px rgba(16, 22, 26, 0.1), 0 0 0 rgba(16, 22, 26, 0), 0 1px 1px rgba(16, 22, 26, 0.2)';
			backgroundStyle.backgroundColor = this.props.locationData.path === '/' ? '' : '#f7f7f9';
		}

		if (hideHero) {
			return backgroundStyle;
		}

		if (this.props.communityData.heroBackgroundImage) {
			const resizedBackgroundImage = getResizedUrl(
				this.props.communityData.heroBackgroundImage,
				'fit-in',
				'1500x600',
			);
			backgroundStyle.backgroundImage = `url("${resizedBackgroundImage}")`;
		}
		const heroBackgroundColor =
			this.props.communityData.heroBackgroundColor ||
			this.props.communityData.accentColorDark;
		if (heroBackgroundColor) {
			backgroundStyle.backgroundColor = this.props.communityData.heroBackgroundColor;
		}

		return backgroundStyle;
	}

	render() {
		const headerLinks = this.props.communityData.headerLinks || [];
		const hideHero = this.props.locationData.path !== '/' || this.props.communityData.hideHero;
		const hideHeaderLogo = !hideHero && this.props.communityData.hideHeaderLogo;
		const componentClasses = this.calculateComponentClasses(hideHero);
		const mainClasses = this.calculateMainClasses(hideHero);
		const heroClasses = this.calculateHeroClasses(hideHero);
		const backgroundStyle = this.calculateBackgroundStyle(hideHero);

		const loggedIn = !!this.props.loginData.slug;
		const isAdmin = this.props.loginData.isAdmin;
		const isBasePubPub = this.props.locationData.isBasePubPub;
		const isPage =
			this.props.communityData.pages &&
			this.props.communityData.pages.reduce((prev, curr) => {
				if (
					curr.slug === this.props.locationData.params.slug ||
					(!curr.slug && this.props.locationData.path === '/')
				) {
					return true;
				}
				return prev;
			}, false);

		const resizedHeaderLogo = getResizedUrl(
			this.props.communityData.headerLogo,
			'fit-in',
			'0x50',
		);
		const resizedHeroLogo = getResizedUrl(this.props.communityData.heroLogo, 'fit-in', '0x200');
		const resizedHeroImage = getResizedUrl(
			this.props.communityData.heroImage,
			'fit-in',
			'600x0',
		);
		const redirectString = `?redirect=${this.props.locationData.path}${
			this.props.locationData.queryString.length > 1
				? this.props.locationData.queryString
				: ''
		}`;
		const heroPrimaryButton = this.props.communityData.heroPrimaryButton || {};
		const heroSecondaryButton = this.props.communityData.heroSecondaryButton || {};

		return (
			<header className={`header-component ${componentClasses}`} style={backgroundStyle}>
				<div className={mainClasses}>
					<GridWrapper columnClassName="main-content">
						<div className="logo-wrapper">
							{!hideHeaderLogo && (
								<a href="/" aria-label={this.props.communityData.title}>
									{this.props.communityData.headerLogo && (
										<React.Fragment>
											<img
												alt=""
												style={isBasePubPub ? { padding: '1px 0px' } : {}}
												src={resizedHeaderLogo}
											/>
										</React.Fragment>
									)}
									{!this.props.communityData.headerLogo && (
										<span>{this.props.communityData.title}</span>
									)}
								</a>
							)}
						</div>
						<div className="buttons-wrapper">
							{headerLinks.map((linkItem, index) => {
								const key = `${index}-${linkItem.title}`;
								if (linkItem.children) {
									return (
										<DropdownButton
											key={key}
											label={linkItem.title}
											isMinimal={true}
											isLarge={true}
											className="hide-on-mobile"
										>
											<Menu>
												{linkItem.children.map((child, cIndex) => {
													const childKey = `${cIndex}-${child.title}`;
													return (
														<MenuItem
															key={childKey}
															text={child.title}
															href={child.url}
															target={child.external ? '_blank' : ''}
															rel={
																child.external
																	? 'noopener noreferrer'
																	: ''
															}
														/>
													);
												})}
											</Menu>
										</DropdownButton>
									);
								}
								return (
									<AnchorButton
										key={key}
										minimal={true}
										large={true}
										text={linkItem.title}
										href={linkItem.url}
										target={linkItem.external ? '_blank' : ''}
										rel={linkItem.external ? 'noopener noreferrer' : ''}
										className="hide-on-mobile"
									/>
								);
							})}
							{!isBasePubPub &&
								loggedIn &&
								(!this.props.communityData.hideCreatePubButton || isAdmin) && (
									<Button
										large={true}
										minimal={true}
										text="New Pub"
										onClick={this.handleCreatePub}
										loading={this.state.isLoading}
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
							{isAdmin && (
								<AnchorButton
									minimal={true}
									large={true}
									href={
										isPage
											? `/dashboard/pages/${this.props.locationData.params
													.slug || ''}`
											: '/dashboard'
									}
									text="Manage"
								/>
							)}
							{loggedIn && (
								<Popover
									content={
										<Menu>
											<li>
												<a
													href={`/user/${this.props.loginData.slug}`}
													className="bp3-menu-item bp3-popover-dismiss"
												>
													<div>{this.props.loginData.fullName}</div>
													<div className="subtext">View Profile</div>
												</a>
											</li>
											<li>
												<a
													href="/privacy/settings"
													className="bp3-menu-item bp3-popover-dismiss"
												>
													<div>Privacy settings</div>
												</a>
											</li>
											<MenuDivider />
											{/* !isBasePubPub &&
														<li>
															<a href="/pub/create" className="bp3-menu-item bp3-popover-dismiss">
																Create New Pub
															</a>
														</li>
													*/}
											{/* !isBasePubPub && isAdmin &&
														<li>
															<a href="/dashboard" className="bp3-menu-item bp3-popover-dismiss">
																Manage Community
															</a>
														</li>
													*/}
											<MenuItem text="Logout" onClick={this.handleLogout} />
										</Menu>
									}
									interactionKind={PopoverInteractionKind.CLICK}
									position={Position.BOTTOM_RIGHT}
									transitionDuration={-1}
									inheritDarkTheme={false}
								>
									<Button large={true} minimal={true}>
										<Avatar
											userInitials={this.props.loginData.initials}
											userAvatar={this.props.loginData.avatar}
											width={30}
										/>
									</Button>
								</Popover>
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
					</GridWrapper>
				</div>
				{!hideHero && (
					<div className={heroClasses}>
						<GridWrapper columnClassName="hero-content">
							<div className="hero-copy">
								{this.props.communityData.heroLogo && (
									<div className="hero-logo">
										<img
											alt={this.props.communityData.title}
											src={resizedHeroLogo}
										/>
									</div>
								)}
								{this.props.communityData.heroTitle && (
									<div className="hero-title">
										{this.props.communityData.heroTitle}
									</div>
								)}
								{this.props.communityData.heroText && (
									<div className="hero-text">
										{this.props.communityData.heroText}
									</div>
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
							{this.props.communityData.heroImage && (
								<div className="hero-image">
									<img alt="Community banner" src={resizedHeroImage} />
								</div>
							)}
						</GridWrapper>
					</div>
				)}
			</header>
		);
	}
}

// Header.defaultProps = defaultProps;
Header.propTypes = propTypes;
export default Header;
