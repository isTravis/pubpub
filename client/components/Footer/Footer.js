import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	Button,
	InputGroup,
	Checkbox,
	Position,
	Popover,
	PopoverInteractionKind,
} from '@blueprintjs/core';
import { GridWrapper } from 'components';
import Icon from 'components/Icon/Icon';
import { apiFetch } from 'utils';

require('./footer.scss');

const propTypes = {
	isBasePubPub: PropTypes.bool.isRequired,
	isAdmin: PropTypes.bool.isRequired,
	communityData: PropTypes.object.isRequired,
	socialItems: PropTypes.array.isRequired,
};

class Footer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			isLoadingSubscribe: false,
			isSubscribed: false,
			isConfirmed: false,
		};
		this.handleEmailChange = this.handleEmailChange.bind(this);
		this.handleEmailSubmit = this.handleEmailSubmit.bind(this);
		this.handleConfirmChange = this.handleConfirmChange.bind(this);
		this.links = props.isBasePubPub
			? [
					{ id: 1, title: 'Create your community', url: '/create/community' },
					{ id: 2, title: 'Login', url: '/login' },
					{ id: 3, title: 'Signup', url: '/signup' },
					{ id: 4, title: 'Terms', url: '/tos' },
					// { id: 6, title: 'Help', url: 'https://meta.pubpub.org/help' },
			  ]
			: [
					{ id: 1, title: 'Dashboard', url: '/dashboard', adminOnly: true },
					{ id: 2, title: 'RSS', url: '/rss.xml' },
					{ id: 3, title: 'Terms', url: '/tos' },
					// { id: 6, title: 'Help', url: 'https://meta.pubpub.org/help' },
			  ];
	}

	handleEmailChange(evt) {
		this.setState({ email: evt.target.value });
	}

	handleEmailSubmit(evt) {
		evt.preventDefault();
		this.setState({
			isLoadingSubscribe: true,
		});
		if (!this.state.isConfirmed) {
			this.setState({
				isLoadingSubscribe: false,
			});
			return false;
		}
		return apiFetch('/api/subscribe', {
			method: 'POST',
			body: JSON.stringify({
				email: this.state.email,
			}),
		})
			.then(() => {
				this.setState({
					isLoadingSubscribe: false,
					email: '',
					isSubscribed: true,
				});
			})
			.catch((err) => {
				console.error(err);
				this.setState({
					isLoadingSubscribe: false,
				});
			});
	}

	handleConfirmChange(evt) {
		this.setState({ isConfirmed: evt.target.checked });
	}

	render() {
		const pubpubLogo =
			this.props.communityData.headerColorType === 'light'
				? '/static/logoBlack.svg'
				: '/static/logoWhite.svg';
		const wrapperClasses = this.props.isBasePubPub
			? 'base-pubpub'
			: 'accent-background accent-color';
		const socialItems = this.props.isBasePubPub
			? [
					{
						id: 'si-1',
						icon: <Icon icon="twitter" />,
						title: 'Twitter',
						value: 'pubpub',
						url: 'https://twitter.com/pubpub',
					},
					{
						id: 'si-2',
						icon: <Icon icon="github" />,
						title: 'Github',
						value: 'pubpub',
						url: 'https://github.com/pubpub',
					},
					{
						id: 'si-3',
						icon: <Icon icon="envelope" />,
						title: 'Contact',
						value: 'hello@pubpub.org',
						url: 'mailto:hello@pubpub.org?subject=Contact',
					},
			  ]
			: this.props.socialItems;

		return (
			<div className={`footer-component ${wrapperClasses}`}>
				<GridWrapper>
					<div className="left">
						<div className="title">
							<a href="https://pubpub.org">
								<img className="logo" src={pubpubLogo} alt="PubPub logo" />
							</a>
							<ul className="social-list">
								<li>
									<a href="https://twitter.com/pubpub">
										<Icon icon="twitter" />
									</a>
								</li>
								<li>
									<a href="mailto:hello@pubpub.org?subject=Contact">
										<Icon icon="envelope" />
									</a>
								</li>
								<li>
									<a href="https://github.com/pubpub">
										<Icon icon="github" />
									</a>
								</li>
							</ul>
						</div>
						<ul className="separated">
							<li>
								<a href="https://pubpub.org/about">About</a>
							</li>
							<li>
								<a href="https://pubpub.org/explore">Explore</a>
							</li>
							<li>
								<a href="https://pubpub.org/pricing">Pricing</a>
							</li>
							<li>
								<a href="https://help.pubpub.org">Help</a>
							</li>
						</ul>

						<form onSubmit={this.handleEmailSubmit}>
							<strong>Feature & Community Newsletter</strong>
							<InputGroup
								type="email"
								placeholder="Your Email"
								value={this.state.email}
								onChange={this.handleEmailChange}
								label="Feature & community newsletter"
								rightElement={
									<Button
										type="submit"
										icon={!this.state.isSubscribed ? 'arrow-right' : 'tick'}
										minimal={true}
										loading={this.state.isLoadingSubscribe}
									/>
								}
								disabled={this.state.isSubscribed}
							/>
							<div className="confirm">
								<Checkbox
									checked={this.state.isConfirmed}
									disabled={this.state.isSubscribed}
									required="required"
									onChange={this.handleConfirmChange}
									label={
										<span>
											<Popover
												interactionKind={PopoverInteractionKind.HOVER}
												popoverClassName="bp3-popover-content-sizing"
												position={Position.RIGHT}
											>
												<p>
													<em>I agree to receive this newsletter.</em>
												</p>
												<div>
													<p>
														We use a third party provider, Mailchimp, to
														deliver our newsletters. We never share your
														data with anyone, and you can unsubscribe
														using the link at the bottom of every email.
														Learn more by visiting your&nbsp;
														<a href="/privacy">privacy settings</a>.
													</p>
												</div>
											</Popover>
										</span>
									}
								/>
							</div>
						</form>
					</div>
					<div className="right">
						<div className="title">
							<a href="/">{this.props.communityData.title}</a>
						</div>
						<ul className="separated">
							{this.links
								.filter((item) => {
									return !item.adminOnly || this.props.isAdmin;
								})
								.map((link) => {
									return (
										<li key={`footer-item-${link.id}`}>
											<a href={link.url}>{link.title}</a>
										</li>
									);
								})}
						</ul>
						{!!socialItems.length && (
							<ul className="social-list">
								{socialItems.map((item) => {
									return (
										<a href={item.url} key={`social-item-${item.id}`}>
											<li>{item.icon}</li>
										</a>
									);
								})}
							</ul>
						)}
					</div>
				</GridWrapper>
			</div>
		);
	}
}

Footer.propTypes = propTypes;
export default Footer;
