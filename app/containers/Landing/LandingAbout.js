import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { Menu, NonIdealState, Button } from '@blueprintjs/core';
import { PreviewPub, PreviewJournal } from 'components';
import { createSignUp } from 'containers/SignUp/actions';
import { globalStyles } from 'utils/globalStyles';
import { getLandingFeatures } from './actions';

let styles;

export const Landing = React.createClass({
	propTypes: {
		landingData: PropTypes.object,
		signUpData: PropTypes.object,
		dispatch: PropTypes.func,
	},

	getInitialState() {
		return {
			email: '',
		};
	},

	componentWillMount() {
		this.props.dispatch(getLandingFeatures());
	},

	componentWillReceiveProps(nextProps) {
		if (this.props.signUpData.loading && !nextProps.signUpData.loading && !nextProps.signUpData.error) { 
			browserHistory.push('/signup');
		}
	},

	inputUpdateLowerCase: function(key, evt) {
		const value = evt.target.value || '';
		this.setState({ [key]: value.toLowerCase() });
	},

	handleSubmit: function(evt) {
		evt.preventDefault();
		this.props.dispatch(createSignUp(this.state.email));
	},

	render() {
		const landingData = this.props.landingData || {};
		const pubs = landingData.pubs || [];
		const journals = landingData.journals || [];

		const featureBlockData = [
			{
				icon: 'pt-icon-annotation',
				title: 'Author Driven Publishing',
				text: 'A rich and collaborative open-source editor allows for evolving content and formats. Publishing is by the author and immediate. Publishing is versioned and we encourage publishing early and often to capture the full history of your work.',
			},
			{
				icon: 'pt-icon-chat',
				title: 'Distributed, Collaborative Review',
				text: 'Review is distributed across many communities and done in the open. Rewarding constructive reviews and incentivizing progress rather than elitism opens the process to all that are capable.',
			},
			{
				icon: 'pt-icon-manual',
				title: 'Grassroots Journals',
				text: 'Journals serve as curators rather than gatekeepers. Pubs can be submitted to and featured in as many journals as is relevant. No more silos. Journals can be run for large or small audiences, by institutions or individuals. Everyone can be a journal.',
			},
		];

		return (
			<div style={styles.container}>

				<div style={styles.headerSection}>
					<div style={styles.headerImage} />
					<div style={styles.headerGradient} />
					<div style={styles.headerContent}>
						<div style={styles.splashTitle}>Read, Write, Publish, Review</div>
						<p style={styles.splashDetails}>PubPub is a free and open tool for collaborative editing, instant publishing, continuous review, and grassroots journals.</p>

						{/*<div className={'pt-button-groupp pt-large'} style={styles.splashButtons}>
							<Link to={'/pubs/create'} className={'pt-button background-button'} style={{ marginRight: '1em' }}>Create a Pub</Link>
							<Link to={'/journals/create'} className={'pt-button background-button'} style={{ marginRight: '1em' }}>Create a Journal</Link>
						</div>*/}
						<div style={styles.signupText}>Sign up to publish, curate, or follow work you care about.</div>
						<form onSubmit={this.handleSubmit}>
							<div className="pt-control-group" style={styles.signupForm}>
								<div className="pt-input-group pt-large">
									<input style={styles.signupInput} type="email" className="pt-input" placeholder="example@email.com" value={this.state.email} onChange={this.inputUpdateLowerCase.bind(this, 'email')} />
								</div>
							
								<Button role={'submit'} className="pt-button pt-intent-primary pt-large" onClick={this.handleSubmit} text={'Join PubPub'} loading={this.props.signUpData.loading} />								
							</div>
						</form>
						{!!this.props.signUpData.error &&
							<div style={styles.errorMessage}>{this.props.signUpData.error}</div>
						}
						
					</div>
				</div>

				<div style={styles.section()}>
					<div style={styles.sectionContent}>
						{featureBlockData.map((feature, index)=> {
							return (
								<div style={styles.featureBlock} key={`feature-${index}`}>
									<span className={`pt-icon-large ${feature.icon}`} style={styles.featureIcon}/>
									<div style={styles.featureContent}>
										<div style={styles.featureTitle}>{feature.title}</div>
										<div style={styles.featureText}>{feature.text}</div>
									</div>

								</div>
							);
						})}
						
					</div>
				</div>

				<div style={styles.section(true)}>
					<div style={styles.sectionContent}>
						<Link style={styles.sectionButton} className={'pt-button pt-intent-primary'} to={'/pubs/create'}>Create New Pub</Link>

						<div style={styles.sectionTitle}>
							<span className={'pt-icon-large pt-icon-application'} style={styles.sectionIcon}/>
							Pubs
						</div>
						<div style={styles.sectionText}>A pub contains all of the content needed to document and reproduce your research. Pubs maintain full revision histories, can have collaborators, and provide a platform for review and discussion.</div>

						
						{pubs.map((pub, index)=> {
							return (
								<div style={styles.previewWrapper} key={`pub-${pub.id}`}>
									<PreviewPub pub={pub} />
								</div>
							);
						})}
					</div>
				</div>

				<div style={styles.section()}>
					<div style={styles.sectionContent}>
						<Link style={styles.sectionButton} className={'pt-button pt-intent-primary'} to={'/journals/create'}>Create New Journal</Link>
						
						<div style={styles.sectionTitle}>
							<span className={'pt-icon-large pt-icon-applications'} style={styles.sectionIcon}/>
							Journals
						</div>
						<div style={styles.sectionText}>Journals are tools for curation. Journals can enforce their own strategies for peer-review, feature content that is relevant to their community, and organize discussions to support progress.</div>

						{journals.map((journal, index)=> {
							return (
								<div style={styles.previewWrapper} key={`journal-${journal.id}`}>
									<PreviewJournal journal={journal} />
								</div>
							);
						})}
					</div>
				</div>

				<div style={styles.section(true)}>
					<div style={styles.sectionContent}>
						<a style={styles.sectionButton} className={'pt-button pt-intent-primary'} href={'https://github.com/pubpub/pubpub'}>View Code on Github</a>
						
						<div style={styles.sectionTitle}>
							<span className={'pt-icon-large pt-icon-git-branch'} style={styles.sectionIcon}/>
							Build the Publishing world you want
						</div>
						<div style={styles.sectionText}>PubPub is an open-source tool built for and by the community that uses it. Join PubPub, contribute code, design, features. Keep up to date with where we’re heading.</div>

					</div>
				</div>
				

			</div>
		);
	}
});

export default Radium(Landing);

styles = {
	container: {
		// padding: '1.5em',
		// width: 'calc(100% - 3em)',
		// maxWidth: '1024px',
		// margin: '0 auto',
	},
	headerSection: {
		position: 'relative',

	},
	headerImage: {
		backgroundImage: 'url("https://assets.pubpub.org/_site/landingBackground.jpeg")',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
		backgroundSize: 'cover',
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 1,
	},
	headerGradient: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 1,
		opacity: 0.8,
		// background: 'linear-gradient(141deg, #0FB8A7 0%,  #2a93e4 75%)',
		background: 'linear-gradient(115deg, #53C0FD 0%, #3023AE 100%)',
	},

	headerContent: {
		padding: '150px 1.5em 150px',
		width: 'calc(100% - 3em)',
		maxWidth: '1024px',
		margin: '0 auto',
		zIndex: 2,
		position: 'relative',
		color: 'white',
	},
	splashTitle: {
		fontSize: '3em',
		fontWeight: '600',
	},
	splashDetails: {
		padding: '1em 0em',
		maxWidth: '500px',
		fontSize: '1.5em',
		fontWeight: 200,
		letterSpacing: '1px',
	},
	signupText: {
		padding: '3em 0em 0.5em',
		fontWeight: '200',
	},
	signupForm: {
		maxWidth: '100%',
	},
	signupInput: {
		width: '300px',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: 'auto',
		}
	},
	errorMessage: {
		margin: '10px 0px',
		padding: '5px',
		position: 'absolute',
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
		color: globalStyles.errorRed,
	},
	section: (isGray)=> {
		return {
			backgroundColor: isGray ? '#F3F3F4' : '#FFF',
		};
	},
	sectionContent: {
		padding: '4em 1.5em',
		width: 'calc(100% - 3em)',
		maxWidth: '1024px',
		margin: '0 auto',
	},
	sectionButton: {
		float: 'right',
		marginLeft: '2em',
	},
	sectionIcon: {
		fontSize: '30px',
		// position: 'absolute',
		color: '#5c7080',
		marginRight: '0.5em',
	},
	sectionHeader: {
		// marginLeft: '45px',
	},
	sectionTitle: {
		fontSize: '2em',
		fontWeight: '600',
	},
	sectionText: {
		padding: '0.5em 0em',
		opacity: 0.85,
		maxWidth: '600px',
	},
	featureBlock: {
		display: 'inline-block',
		width: '33%',
		verticalAlign: 'top',
		padding: '2em 2em 2em 0em',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			display: 'block',
			width: '100%',
		}
	},
	featureIcon: {
		color: '#5c7080',
		position: 'absolute',
		fontSize: '25px',
	},
	featureContent: {
		marginLeft: '35px',
	},
	featureTitle: {
		fontSize: '1.15em',
		paddingBottom: '0.5em',
		fontWeight: 500,
	},
	featureText: {
		opacity: 0.85,
	},
	previewWrapper: {
		marginTop: '2em',
		backgroundColor: 'white',
	},
	
};
