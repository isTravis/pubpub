import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleRoot } from 'radium';
import Helmet from 'react-helmet';
import { IntlProvider } from 'react-intl';
import { AppNav, AppFooter, Announcements } from 'components';
import { login, logout } from './actions';

require('../../../static/blueprint.scss');
require('../../../static/style.scss');
require('../../../static/pubBody.scss');

export const App = React.createClass({
	propTypes: {
		appData: PropTypes.object,
		accountData: PropTypes.object,
		journalData: PropTypes.object,
		pubData: PropTypes.object,
		location: PropTypes.object,
		params: PropTypes.object,
		children: PropTypes.object,
		dispatch: PropTypes.func,
	},

	componentWillMount() {
		const FocusStyleManager = require('@blueprintjs/core').FocusStyleManager;
		FocusStyleManager.onlyShowFocusOnTabs();
		this.props.dispatch(login());
	},

	logoutHandler: function() {
		this.props.dispatch(logout());
	},

	isProduction: function() {
		const hostname = window.location.hostname;
		if (hostname === 'dev.pubpub.org' || hostname === 'staging.pubpub.org') {
			return false;
		}
		return true;
	},

	render() {
		const loginFinished = this.props.appData.loginFinished;
		const hiddenStyle = loginFinished
			? {}
			: { height: '0px', overflow: 'hidden', opacity: 0 };
		return (
			<IntlProvider locale={'en'} messages={{}}>
				<StyleRoot>
					<Helmet 
						title="PubPub"  
						meta={[
							{ name: 'ROBOTS', content: this.isProduction() ? 'INDEX, FOLLOW' : 'NOINDEX, NOFOLLOW' },
							{ name: 'description', content: 'PubPub is a free and open tool for collaborative editing, instant publishing, continuous review, and grassroots journals.' },
							{ property: 'og:title', content: 'PubPub' },
							{ property: 'og:type', content: 'website' },
							{ property: 'og:description', content: 'PubPub is a free and open tool for collaborative editing, instant publishing, continuous review, and grassroots journals.' },
							{ property: 'og:url', content: 'https://www.pubpub.org/' },
							{ property: 'og:image', content: 'https://assets.pubpub.org/_site/logo_dark.png' },
							{ property: 'og:image:url', content: 'https://assets.pubpub.org/_site/logo_dark.png' },
							{ property: 'og:image:width', content: '500' },
							{ property: 'fb:app_id', content: '924988584221879' },
							{ name: 'twitter:card', content: 'summary' },
							{ name: 'twitter:site', content: '@pubpub' },
							{ name: 'twitter:title', content: 'PubPub' },
							{ name: 'twitter:description', content: 'PubPub is a free and open tool for collaborative editing, instant publishing, continuous review, and grassroots journals.' },
							{ name: 'twitter:image', content: 'https://assets.pubpub.org/_site/logo_dark.png' },
							{ name: 'twitter:image:alt', content: 'Logo for PubPub' }
						]} 
					/> 
					<div style={hiddenStyle}>
						<Announcements />
						<AppNav accountData={this.props.accountData} pubData={this.props.pubData} journalData={this.props.journalData} location={this.props.location} params={this.props.params} logoutHandler={this.logoutHandler} />
						<div style={{ minHeight: 'calc(100vh - 75px)' }}>{this.props.children}</div>
						<AppFooter />
					</div>
				</StyleRoot>
			</IntlProvider>
		);
	},

});

function mapStateToProps(state) {
	return {
		appData: state.app.toJS(),
		accountData: state.account.toJS(),
		journalData: state.journal.toJS(),
		pubData: state.pub.toJS(),
	};
}

export default connect(mapStateToProps)(App);

