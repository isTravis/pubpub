import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import Helmet from 'react-helmet';
// import {globalStyles} from 'utils/styleConstants';
// import {PreviewCard} from 'components';
import {About} from 'components';
// import { Link } from 'react-router';
import {s3Upload} from 'utils/uploadFile';
import {createAtom} from 'containers/Media/actions';
import {isWebUri} from 'valid-url';

// import Select from 'react-select';
import request from 'superagent';
// import {push} from 'redux-router';
import {match} from '../../components/AtomTypes/Embed/oEmbed';
import Dropzone from 'react-dropzone';

let styles = {};

export const Landing = React.createClass({
	propTypes: {
		landingData: PropTypes.object,
		loginData: PropTypes.object,
		dispatch: PropTypes.func
	},

	getInitialState() {
		return {
			value: undefined,
			source: false,
		};
	},

	handleSourceChange: function(evt) {
		const source = evt.target.value;
		this.setState({source});
	},

	handleSourceSubmit: function(evt) {
		const source = this.state.source;
		let atomType = undefined;
		let props = {};
		if (source && match(source)) {
			atomType = 'embed';
			props = {source};
		} else	if (source && isWebUri(source)) {
			atomType = 'iframe';
			props = {source};
		} else {
			atomType = 'latex';
			props = {text: source};
			// add more text atom types here
		}
		this.props.dispatch(createAtom(atomType, props));
	},

	handleFileSelect: function(evt) {
		if (evt.target.files.length) {
			s3Upload(evt.target.files[0], ()=>{}, this.onFileFinish, 0);
		}
	},

	onDrop: function(files) {
		s3Upload(files[0], ()=>{}, this.onFileFinish, 0);
	},

	onFileFinish: function(evt, index, type, filename) {

		let atomType = undefined;
		const extension = filename.split('.').pop();
		switch (extension) {
		case 'jpg':
		case 'png':
		case 'jpeg':
		case 'tiff':
		case 'gif':
			atomType = 'image'; break;
		case 'pdf':
			atomType = 'pdf'; break;
		case 'ipynb':
			atomType = 'jupyter'; break;
		case 'mp4':
		case 'ogg':
		case 'webm':
			atomType = 'video'; break;
		case 'csv':
			atomType = 'table'; break;
		default:
			break;
		}

		const versionContent = {
			url: 'https://assets.pubpub.org/' + filename
		};
		this.props.dispatch(createAtom(atomType, versionContent, null, true));
	},

	handleSelectChange: function(value) {
		console.log(value);
		this.setState({ value });
		// this.props.dispatch(push('/' + value.value));
	},

	loadOptions: function(input, callback) {
		if (!input || input.length < 3) {
			callback(null, { options: [] });
			return undefined;
		}
		request.get('/api/autocompletePubsAndUsersAndJournals?string=' + input).end((err, response)=>{
			const responseArray = response.body || [];
			const options = responseArray.map((item)=>{
				return {
					value: item.slug || item.username,
					label: item.journalName || item.name || item.title,
					id: item._id,
				};
			});
			callback(null, { options: options });
		});
	},

	render: function() {
		const metaData = {
			title: 'PubPub',
		};
		// const loggedIn = this.props.loginData && this.props.loginData.get('loggedIn');

		return (
			<div style={styles.container}>

				<Helmet {...metaData} />

				{/* If not loggedIn, display the About PubPub content*/}
				{/* !loggedIn &&
					<About />
				*/}

				<About />

				<div className={'lightest-bg'}>
					<div className={'section'}>
						<Dropzone ref="dropzone" disableClick={true} onDrop={this.onDrop} style={{}} activeClassName={'dropzone-active'} >
							<div className={'button'} style={styles.dropzoneBlock}>
								Click or Drag files to add
								<input id={'media-file-select'} type={'file'} onChange={this.handleFileSelect} multiple={true} style={styles.fileInput}/>
							</div>
							<div className={'showOnActive'}>Drop files to add</div>
						</Dropzone>

					</div>
				</div>

						{/* <input type="file" accept="*" onChange={this.handleFileSelect} />
						<form>
							<input type="text" onChange={this.handleSourceChange} />
							<input type="button" value="Create Atom" onClick={this.handleSourceSubmit} />
						</form> */}


						{/* <Select.Async
							name="form-field-name"
							value={this.state.value}
							loadOptions={this.loadOptions}
							placeholder={<span>Search</span>}
							onChange={this.handleSelectChange} /> */}

						{/* <h2>Recent Activity</h2>

						<PreviewCard
							image={'http://res.cloudinary.com/pubpub/image/upload/c_limit,h_250,w_250/v1449761714/3eb7882_iavg9s.jpg'}
							title={'Thariq Shihipar'}
							description={'Intent on eating every bagel on earth until I burst.'} />
						<PreviewCard
							image={'http://res.cloudinary.com/pubpub/image/upload/c_limit,h_250,w_250/v1449761714/3eb7882_iavg9s.jpg'}
							title={'Thariq Shihipar'}
							description={'Intent on eating every bagel on earth until I burst.'} />
						<PreviewCard
							image={'http://res.cloudinary.com/pubpub/image/upload/c_limit,h_250,w_250/v1449761714/3eb7882_iavg9s.jpg'}
							title={'Thariq Shihipar'}
							description={'Intent on eating every bagel on earth until I burst.'} />
						<PreviewCard
							image={'http://res.cloudinary.com/pubpub/image/upload/c_limit,h_250,w_250/v1449761714/3eb7882_iavg9s.jpg'}
							title={'Thariq Shihipar'}
							description={'Intent on eating every bagel on earth until I burst.'} />
						<PreviewCard
							image={'http://res.cloudinary.com/pubpub/image/upload/c_limit,h_250,w_250/v1449761714/3eb7882_iavg9s.jpg'}
							title={'Thariq Shihipar'}
							description={'Intent on eating every bagel on earth until I burst.'} /> */}
				{/*  	</div>
				</div> */}

			</div>
		);
	}

});

export default connect( state => {
	return {
		loginData: state.login,
		landingData: state.landing,
	};
})( Radium(Landing) );

styles = {
	dropzoneBlock: {
		padding: '0em 2em',
		margin: '0em 1em',
		fontSize: '0.85em',
		borderStyle: 'dashed',
		height: '34px',
		lineHeight: '34px',
		verticalAlign: 'top',
		position: 'relative',
		overflow: 'hidden',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			margin: '0em',
		},
	},
	fileInput: {
		marginBottom: '0em',
		width: '100%',
		position: 'absolute',
		height: 'calc(100% + 20px)',
		left: 0,
		top: -20,
		padding: 0,
		cursor: 'pointer',
		opacity: 0,
	},
};
