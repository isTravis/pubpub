import React, {PropTypes} from 'react';
import Radium from 'radium';
import {Loader} from 'components';
import ImageCropperEditor from './ImageCropperEditor';
import {s3Upload} from 'utils/uploadFile';

import {globalMessages} from 'utils/globalMessages';
import {FormattedMessage} from 'react-intl';

let styles = {};

export const ImageCropper = React.createClass({
	propTypes: {
		width: PropTypes.number,
		height: PropTypes.number,
		image: PropTypes.object,
		onCancel: PropTypes.func,
		onUpload: PropTypes.func,
	},

	getInitialState: function() {
		return {
			scale: 1,
			preview: null,
			isUploading: false,
		};
	},
	onFileFinish: function(evt, index, type, filename) {
		// console.log('https://s3.amazonaws.com/pubpub-upload/' + filename);
		// console.log('finish');
		this.setState({isUploading: false});
		this.props.onUpload('https://assets.pubpub.org/' + filename);
	},
	handleUpdate: function() {
		const img = this.refs.userImageCrop.getImage('image/jpeg');
		this.setState({preview: img});
	},
	handleSaveImage: function() {
		const binary = atob(this.state.preview.split(',')[1]);
		const mimeString = this.state.preview.split(',')[0].split(':')[1].split(';')[0];
		const array = [];
		for (let iii = 0; iii < binary.length; iii++) { array.push(binary.charCodeAt(iii));}
		const file = new Blob([new Uint8Array(array)], {type: mimeString});

		this.setState({isUploading: true});
		s3Upload(file, ()=>{}, this.onFileFinish, 0);

	},
	handleScale: function() {
		const scale = this.refs.scale.value;
		const img = this.refs.userImageCrop.getImage('image/jpeg');
		this.setState({scale: scale, preview: img});
	},

	handleCancel: function() {
		this.props.onCancel();
	},

	render: function() {
		const canvasStyle = {
			transform: 'scale(' + 200 / (this.props.width + 50) + ')',
			transformOrigin: 'top left',
		};

		return (
			<div style={styles.container}>
				<div style={styles.avatarWrapper}>
					<ImageCropperEditor
						ref="userImageCrop"
						image={this.props.image}
						width={this.props.width}
						height={this.props.height}
						border={25}
						color={[0, 0, 0, 0.7]} // RGBA
						scale={parseFloat(this.state.scale)}
						onImageReady={this.handleUpdate}
						onImageChange={this.handleUpdate}
						style={canvasStyle}/>

						<input style={styles.slider} name="scale" type="range" ref="scale" onChange={this.handleScale} min="1" max="3" step="0.01" defaultValue="1" />
				</div>
				<div style={styles.previewAndOptions}>
					<img style={styles.preview}src={this.state.preview} />
					<div className={'button'} style={styles.option} key="userUploadCancel" onClick={this.handleCancel}>
						<FormattedMessage {...globalMessages.Cancel} />
					</div>
					<div className={'button'} style={styles.option} key="userUploadSave" onClick={this.handleSaveImage}>
						<FormattedMessage {...globalMessages.Save} />
					</div>
				</div>
				<div style={styles.loaderWrapper}>
					<Loader loading={this.state.isUploading}/>
				</div>


			</div>
		);
	}
});

export default Radium(ImageCropper);

styles = {
	container: {
		width: '100%',
		height: '100%',
		position: 'relative',
		overflow: 'hidden',
	},
	loaderWrapper: {
		position: 'absolute',
		width: '40px',
		bottom: 0,
		right: 0,
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			position: 'static',
			margin: '0 auto',
		},
	},
	avatarWrapper: {
		height: 200,
		width: 200,
		margin: '25px 25px 10px 25px',
		position: 'relative',
		float: 'left',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			margin: '20px auto 5px auto',
			float: 'none',
		},
		// backgroundColor: 'blue',
	},
	previewAndOptions: {
		width: 'calc(100% - 275px)',
		height: 200,
		margin: '25px 25px 10px 0px',
		float: 'left',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: '100%',
			height: 'auto',
			float: 'none',
		},
		// backgroundColor: 'red',
	},
	preview: {
		width: 75,
		float: 'right',
		margin: '0px 0px 45px 0px',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			float: 'none',
			margin: '20px calc(50% - 40px) 10px calc(50% - 40px)',
			width: 80,
		},
	},
	option: {
		clear: 'both',
		width: '75px',
		fontSize: '0.9em',
		float: 'right',
		textAlign: 'center',
		marginBottom: '20px',
		// textAlign: 'right',
		// fontSize: '25px',
		// color: '#555',
		
		// ':hover': {
		// 	cursor: 'pointer',
		// 	color: '#222',
		// },
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: '50%',
			float: 'none',
			display: 'block',
			margin: '20px auto'
		// 	textAlign: 'center',
		// 	fontSize: '35px',
		},
	},
	slider: {
		// marginLeft: '25px',
		width: 200,
		position: 'absolute',
		left: 0,
		bottom: -35,
		margin: 0,
		// clear: 'both',
	},

};
