import React, {PropTypes} from 'react';
import Radium from 'radium';
import Helmet from 'react-helmet';
import {Loader, ImageCropper} from 'components';
import {Link} from 'react-router';
<<<<<<< Updated upstream
import {safeGetInToJS} from 'utils/safeParse';
=======

>>>>>>> Stashed changes

import {globalStyles} from 'utils/styleConstants';
import {globalMessages} from 'utils/globalMessages';
import {FormattedMessage} from 'react-intl';

let styles = {};

export const SignUpDetails = React.createClass({
	propTypes: {
		submitHandler: PropTypes.func,
		errorMessage: PropTypes.string,
		isLoading: PropTypes.bool,
<<<<<<< Updated upstream
		loginData: PropTypes.object,
=======
		userImage: PropTypes.string,
>>>>>>> Stashed changes
		redirectRoute: PropTypes.string,

	},

<<<<<<< Updated upstream
	componentWillMount() {
		const userData = safeGetInToJS(this.props.loginData, ['userData']) || {};
		this.setState({bio: userData.bio || ''});
	},

=======
>>>>>>> Stashed changes
	getInitialState: function() {
		return {
			userImageFile: null,
			userImageURL: undefined,
			bio: '',
		};
	},

	bioUpdate: function() {
<<<<<<< Updated upstream
		this.setState({bio: this.refs.bio.value.substring(0, 140)});
=======
		this.setState({bio: this.refs.detailsBio.value.substring(0, 140)});
>>>>>>> Stashed changes
	},

	detailsSubmit: function(evt) {
		evt.preventDefault();
		const detailsData = {
			image: this.state.userImageURL,
<<<<<<< Updated upstream
			bio: this.refs.bio.value,
			website: this.refs.website.value,
			publicEmail: this.refs.publicEmail.value,
			twitter: this.refs.twitter.value,
			orcid: this.refs.orcid.value,
			github: this.refs.github.value,
			googleScholar: this.refs.googleScholar.value,
=======
			bio: this.refs.detailsBio.value,
			website: this.refs.detailsWebsite.value,
			twitter: this.refs.detailsTwitter.value,
			orcid: this.refs.detailsOrcid.value,
			github: this.refs.detailsGithub.value,
			googleScholar: this.refs.detailsGoogleScholar.value,
>>>>>>> Stashed changes
		};
		this.props.submitHandler(detailsData);	
	},

	handleFileSelect: function(evt) {
		if (evt.target.files.length) {
			this.setState({userImageFile: evt.target.files[0]});
		}
	},

	cancelImageUpload: function() {
		this.setState({userImageFile: null});
	},

	userImageUploaded: function(url) {
		this.setState({userImageFile: null, userImageURL: url});
	},

	render: function() {
		const metaData = {
			title: 'PubPub | Add Details',
		};
		const isLoading = this.props.isLoading;
		const errorMessage = this.props.errorMessage;
<<<<<<< Updated upstream
		const userData = safeGetInToJS(this.props.loginData, ['userData']) || {};

		return (
			<div>
				<Helmet {...metaData} />

				<h1><FormattedMessage id="details.Welcome" defaultMessage="Welcome!"/></h1>
=======

		return (
			<div className={'signup-container'} style={styles.container}>
				<Helmet {...metaData} />

				<h1><FormattedMessage id="details.WelcomeToPubPub" defaultMessage="Welcome to PubPub!"/></h1>
>>>>>>> Stashed changes
				<p style={styles.subHeader}>
					<FormattedMessage id="details.VerificationMessage" defaultMessage="We've sent you a verification email. Please click the link there to verify your account!"/>
				</p>

				<h2><FormattedMessage id="details.AboutYou" defaultMessage="About You"/></h2>
				<p style={styles.subHeader}>
					<FormattedMessage id="details.AddDetailsTo" defaultMessage="Add details to identify yourself to the community and to be rewarded for your contributions!"/>
				</p>
				
				<form onSubmit={this.detailsSubmit}>
					<div>
<<<<<<< Updated upstream
						<label htmlFor={'userImage'}>
							<FormattedMessage {...globalMessages.ProfileImage}/>
						</label>
						<img style={styles.userImage} src={this.state.userImageURL || userData.image} />
=======
						<label style={styles.label} htmlFor={'userImage'}>
							<FormattedMessage {...globalMessages.ProfileImage}/>
						</label>
						<img style={styles.userImage} src={this.state.userImageURL || this.props.userImage} />
>>>>>>> Stashed changes
						<input id={'userImage'} name={'user image'} type="file" accept="image/*" onChange={this.handleFileSelect} />
						
					</div>

					<div>
<<<<<<< Updated upstream
						<label htmlFor={'bio'}>
							<FormattedMessage {...globalMessages.Bio}/>
						</label>
						<textarea ref={'bio'} id={'bio'} name={'bio'} type="text" style={[styles.input, styles.bio]} onChange={this.bioUpdate} value={this.state.bio}></textarea>
						<div className={'light-color inputSubtext'}>
=======
						<label style={styles.label} htmlFor={'bio'}>
							<FormattedMessage {...globalMessages.Bio}/>
						</label>
						<textarea ref={'detailsBio'} id={'bio'} name={'bio'} type="text" style={[styles.input, styles.bio]} onChange={this.bioUpdate} value={this.state.bio}></textarea>
						<div className={'light-color inputSubtext'} to={'/resetpassword'}>
>>>>>>> Stashed changes
							{this.state.bio.length} / 140
						</div>
					</div>

					<div>
<<<<<<< Updated upstream
						<label htmlFor={'publicEmail'}>
							Public Email
						</label>
						<input ref={'publicEmail'} id={'publicEmail'} name={'publicEmail'} type="text" style={styles.input} defaultValue={userData.publicEmail}/>
					</div>

					<div>
						<label htmlFor={'website'}>
							<FormattedMessage {...globalMessages.Website}/>
						</label>
						<input ref={'website'} id={'website'} name={'website'} type="text" style={styles.input} defaultValue={userData.website}/>
					</div>

					<div>
						<label htmlFor={'twitter'}>
=======
						<label style={styles.label} htmlFor={'website'}>
							<FormattedMessage {...globalMessages.Website}/>
						</label>
						<input ref={'detailsWebsite'} id={'website'} name={'website'} type="text" style={styles.input}/>
					</div>

					<div>
						<label style={styles.label} htmlFor={'twitter'}>
>>>>>>> Stashed changes
							Twitter
						</label>
						<div style={styles.prefixedInputWrapper}>
							<div style={styles.prefix}>@</div>
<<<<<<< Updated upstream
							<input ref={'twitter'} id={'twitter'} name={'twitter'} type="text" style={[styles.input, styles.prefixedInput]} defaultValue={userData.twitter}/>	
=======
							<input ref={'detailsTwitter'} id={'twitter'} name={'twitter'} type="text" style={[styles.input, styles.prefixedInput]}/>	
>>>>>>> Stashed changes
						</div>
					</div>

					<div>
<<<<<<< Updated upstream
						<label htmlFor={'orcid'}>
=======
						<label style={styles.label} htmlFor={'orcid'}>
>>>>>>> Stashed changes
							ORCID
						</label>
						<div style={styles.prefixedInputWrapper}>
							<div style={styles.prefix}>orcid.org/</div>
<<<<<<< Updated upstream
							<input ref={'orcid'} id={'orcid'} name={'orcid'} type="text" style={[styles.input, styles.prefixedInput]} defaultValue={userData.orcid}/>	
=======
							<input ref={'detailsOrcid'} id={'orcid'} name={'orcid'} type="text" style={[styles.input, styles.prefixedInput]}/>	
>>>>>>> Stashed changes
						</div>
					</div>

					<div>
<<<<<<< Updated upstream
						<label htmlFor={'github'}>
=======
						<label style={styles.label} htmlFor={'github'}>
>>>>>>> Stashed changes
							Github
						</label>
						<div style={styles.prefixedInputWrapper}>
							<div style={styles.prefix}>github.com/</div>
<<<<<<< Updated upstream
							<input ref={'github'} id={'github'} name={'github'} type="text" style={[styles.input, styles.prefixedInput]} defaultValue={userData.github}/>	
=======
							<input ref={'detailsGithub'} id={'github'} name={'github'} type="text" style={[styles.input, styles.prefixedInput]}/>	
>>>>>>> Stashed changes
						</div>
					</div>

					<div>
<<<<<<< Updated upstream
						<label htmlFor={'googleScholar'}>
=======
						<label style={styles.label} htmlFor={'googleScholar'}>
>>>>>>> Stashed changes
							Google Scholar
						</label>
						<div style={styles.prefixedInputWrapper}>
							<div style={styles.prefix}>scholar.google.com/citations?user=</div>
<<<<<<< Updated upstream
							<input ref={'googleScholar'} id={'googleScholar'} name={'google scholar'} type="text" style={[styles.input, styles.prefixedInput]} defaultValue={userData.googleScholar}/>	
=======
							<input ref={'detailsGoogleScholar'} id={'googleScholar'} name={'google scholar'} type="text" style={[styles.input, styles.prefixedInput]}/>	
>>>>>>> Stashed changes
						</div>
					</div>

					<button className={'button'} onClick={this.detailsSubmit}>
						<FormattedMessage id="details.SaveDetails" defaultMessage="Save Details"/>
					</button>

					<div style={styles.loaderContainer}><Loader loading={isLoading} showCompletion={!errorMessage}/></div>

					<Link to={this.props.redirectRoute || '/'} style={styles.skipLink}><FormattedMessage {...globalMessages.Skipthisstep}/></Link>
					<div style={styles.errorMessage}>{errorMessage}</div>

				</form>

				<div style={[styles.imageCropperWrapper, this.state.userImageFile !== null && styles.imageCropperWrapperVisible]} >
					<div style={styles.imageCropper}>
<<<<<<< Updated upstream
						<ImageCropper height={500} width={500} image={this.state.userImageFile} onCancel={this.cancelImageUpload} onUpload={this.userImageUploaded}/>
=======
						<ImageCropper height={150} width={150} image={this.state.userImageFile} onCancel={this.cancelImageUpload} onUpload={this.userImageUploaded}/>
>>>>>>> Stashed changes
					</div>
				</div>
				
			</div>
		);
	}

});

export default Radium(SignUpDetails);

styles = {
	subHeader: {  
		margin: '-20px 0px 20px 0px',
		fontSize: '0.9em',
	},
	userImage: {
		width: '100px',
	},
	input: {
		width: 'calc(100% - 20px - 4px)',
	},
	bio: {
		height: '4em',
	},
	prefixedInputWrapper: {
		display: 'table',
		width: '100%',
		marginBottom: '1.2em',
	},
	prefix: {
		display: 'table-cell',
		backgroundColor: '#F3F3F4',
		verticalAlign: 'middle',
		textAlign: 'center',
		padding: '4px 10px',
		borderWidth: '2px 0px 2px 2px',
		borderStyle: 'solid',
		borderColor: '#BBBDC0',
		borderRadius: '1px 0px 0px 1px',
		width: '1%',
		fontSize: '0.9em',
		whiteSpace: 'nowrap',
	},
	prefixedInput: {
		display: 'table-cell',
		marginBottom: 0,
		borderRadius: '0px 1px 1px 0px',
	},

	loaderContainer: {
		display: 'inline-block',
		position: 'relative',
		top: 15,
	},
	errorMessage: {
		padding: '10px 0px',
		color: globalStyles.errorRed,
	},
	skipLink: {
		...globalStyles.link,
		fontSize: '0.85em',
	},
	imageCropperWrapper: {
		height: '100vh',
		width: '100vw',
		backgroundColor: 'rgba(255,255,255,0.75)',
		position: 'fixed',
		top: 0,
		left: 0,
		opacity: 0,
		pointerEvents: 'none',
		transition: '.1s linear opacity',
		display: 'flex',
		justifyContent: 'center',
	},
	imageCropperWrapperVisible: {
		opacity: 1,
		pointerEvents: 'auto',
	},
	imageCropper: {
		height: '270px',
		width: '450px',
		alignSelf: 'center',
		backgroundColor: 'white',
		boxShadow: '0px 0px 10px #808284',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: '100%',
			height: 'auto',
			left: 0,
		},
	},
};
