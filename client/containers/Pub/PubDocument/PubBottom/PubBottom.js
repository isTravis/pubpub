import React from 'react';
import PropTypes from 'prop-types';

import { getNotes } from 'components/Editor/utils';

import LicenseSection from './LicenseSection';
import SearchableNoteSection from './SearchableNoteSection';
import DiscussionsSection from './Discussions/DiscussionsSection';
import ReadNextSection from './ReadNextSection';

require('./pubBottom.scss');

const propTypes = {
	pubData: PropTypes.object.isRequired,
	collabData: PropTypes.object.isRequired,
	updateLocalData: PropTypes.func.isRequired,
	sideContentRef: PropTypes.object.isRequired,
	mainContentRef: PropTypes.object.isRequired,
	showDiscussions: PropTypes.bool,
};

const defaultProps = {
	showDiscussions: true,
};

const PubBottom = (props) => {
	const {
		collabData: { editorChangeObject },
		pubData,
		showDiscussions,
		updateLocalData,
		sideContentRef,
		mainContentRef,
	} = props;

	const { citations = [], footnotes = [] } = editorChangeObject.view
		? getNotes(editorChangeObject.view.state.doc)
		: {};

	return (
		<div className="pub-bottom-component">
			<div className="inner">
				<ReadNextSection pubData={pubData} updateLocalData={updateLocalData} />
				{footnotes.length > 0 && (
					<SearchableNoteSection
						title="Footnotes"
						items={footnotes}
						nodeType="footnote"
						searchPlaceholder="Search footnotes..."
						viewNode={
							editorChangeObject &&
							editorChangeObject.view &&
							editorChangeObject.view.dom
						}
					/>
				)}
				{citations.length > 0 && (
					<SearchableNoteSection
						title="Citations"
						items={citations}
						nodeType="citation"
						searchPlaceholder="Search citations..."
						viewNode={
							editorChangeObject &&
							editorChangeObject.view &&
							editorChangeObject.view.dom
						}
					/>
				)}
				<LicenseSection pubData={pubData} updateLocalData={updateLocalData} />
				{showDiscussions && (
					<DiscussionsSection
						pubData={pubData}
						updateLocalData={updateLocalData}
						sideContentRef={sideContentRef}
						mainContentRef={mainContentRef}
					/>
				)}
			</div>
		</div>
	);
};

PubBottom.propTypes = propTypes;
PubBottom.defaultProps = defaultProps;
export default PubBottom;
