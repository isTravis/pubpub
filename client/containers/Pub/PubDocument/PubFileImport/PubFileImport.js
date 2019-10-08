import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AnchorButton } from '@blueprintjs/core';
import { docIsEmpty } from '@pubpub/editor';

import FileImportDialog from './FileImportDialog';

require('./pubFileImport.scss');

const propTypes = {
	editorChangeObject: PropTypes.shape({
		view: PropTypes.shape({ state: PropTypes.shape({ doc: PropTypes.shape({}) }) }),
	}).isRequired,
	updateLocalData: PropTypes.func.isRequired,
};

const PubFileImport = (props) => {
	const {
		editorChangeObject: { view },
	} = props;
	const [isVisible, setIsVisible] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const doc = view && view.state && view.state.doc;

	useEffect(() => {
		const isEmptyDoc = doc && docIsEmpty(doc);
		if (isEmptyDoc) {
			setIsVisible(true);
		} else if (!isDialogOpen) {
			setIsVisible(false);
		}
	}, [doc, isDialogOpen]);

	if (!isVisible) {
		return null;
	}

	return (
		<div className="pub-file-import-component">
			<React.Fragment>
				<AnchorButton
					type="button"
					className="bp3-intent-primary bp3-large"
					onClick={() => setIsDialogOpen(true)}
					text={
						<div>
							<div>Import Files</div>
							<div>.docx, .epub, .html, .md, .odt, .txt, .xml, or .tex</div>
						</div>
					}
				/>
				<FileImportDialog
					{...props}
					isOpen={isDialogOpen}
					onClose={() => setIsDialogOpen(false)}
				/>
			</React.Fragment>
		</div>
	);
};

PubFileImport.propTypes = propTypes;
export default PubFileImport;
