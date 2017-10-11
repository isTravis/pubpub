import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NonIdealState } from '@blueprintjs/core';
import { Editor } from '@pubpub/editor';
import FormattingMenu from '@pubpub/editor/addons/FormattingMenu';
import Collaborative from '@pubpub/editor/addons/Collaborative';
import Image from '@pubpub/editor/addons/Image';
import Video from '@pubpub/editor/addons/Video';
import Iframe from '@pubpub/editor/addons/Iframe';
import InsertMenu from '@pubpub/editor/addons/InsertMenu';
import Discussion from 'components/DiscussionAddon/DiscussionAddon';
import { s3Upload, getFirebaseConfig } from 'utilities';

const propTypes = {
	onRef: PropTypes.func.isRequired,
	clientData: PropTypes.object.isRequired,
	editorKey: PropTypes.string.isRequired,
	onClientChange: PropTypes.func.isRequired,
	isReadOnly: PropTypes.bool,
	threads: PropTypes.array,
	slug: PropTypes.string,
};
const defaultProps = {
	isReadOnly: false,
	threads: [],
	slug: '',
};

const contextTypes = {
	router: PropTypes.object,
};

class PubCollabEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: undefined,
		};
	}
	componentDidCatch(error, info) {
		this.setState({ error: true });
	}
	render() {
		if (this.state.error) {
			return (
				<NonIdealState
					title={'Uh Oh'}
					visual={'error'}
					description={'An error has occured. We\'ve logged the bug and have notified our development team. Please reload the page to continue.'}
					action={
						<button
							className={'pt-button'}
							onClick={()=>{ window.location.reload(); }}
						>
							Reload Page
						</button>
					}
				/>
			);
		}
		return (
			<div>
				{this.props.isReadOnly &&
					<div className={'pt-callout'}>
						<h5>Read Only</h5>
						Track changes and suggestions coming to this beta shortly...
					</div>
				}

				<Editor
					placeholder={'Begin writing here...'}
					ref={this.props.onRef}
					isReadOnly={this.props.isReadOnly}
				>
					{!this.props.isReadOnly &&
						<FormattingMenu />
					}
					{!this.props.isReadOnly &&
						<InsertMenu />
					}
					<Collaborative
						firebaseConfig={getFirebaseConfig()}
						clientData={this.props.clientData}
						editorKey={this.props.editorKey}
						onClientChange={this.props.onClientChange}
					/>
					<Image handleFileUpload={s3Upload} />
					<Video handleFileUpload={s3Upload} />
					<Iframe />
					<Discussion
						threads={this.props.threads}
						routerContext={this.context.router}
						slug={this.props.slug}
					/>
				</Editor>
			</div>
		);
	}
}

PubCollabEditor.propTypes = propTypes;
PubCollabEditor.defaultProps = defaultProps;
PubCollabEditor.contextTypes = contextTypes;
export default PubCollabEditor;
