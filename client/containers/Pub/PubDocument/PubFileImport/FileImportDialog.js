import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import {
	Button,
	ButtonGroup,
	Callout,
	Classes,
	Drawer,
	Icon,
	Spinner,
	Tooltip,
} from '@blueprintjs/core';

import { apiFetch } from 'utils';
import { pingTask } from 'utils/pingTask';

import FileImportEntry from './FileImportEntry';
import { useFileManager } from './useFileManager';
import { extensionToPandocFormat, bibliographyFormats } from './formats';
import { importDocToEditor } from './importDocToEditor';

require('./fileImportDialog.scss');

const propTypes = {
	editorChangeObject: PropTypes.shape({
		view: PropTypes.shape({}),
	}).isRequired,
	updateLocalData: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

const documentExtensions = Object.keys(extensionToPandocFormat).map((ext) => `.${ext}`);
const bibliographyExtensions = bibliographyFormats.map((ext) => `.${ext}`);

const acceptedFileTypes = [...documentExtensions, ...bibliographyExtensions, 'image/*'].join(',');

const getFingerprintOfImportedFiles = (currentFiles) =>
	currentFiles
		.map((file) => file.localPath + '_' + file.label)
		.sort((a, b) => a - b)
		.join('___');

const FileImportDialog = ({ editorChangeObject, updateLocalData, isOpen, onClose }) => {
	const { addFile, getFiles, deleteFileById, labelFileById } = useFileManager();
	const currentFiles = getFiles();
	const incompleteUploads = currentFiles.filter((file) => file.state !== 'complete');
	const hasDocumentToImport = currentFiles.some((file) => file.label === 'document');
	const [importResult, setImportResult] = useState({});
	const [isImporting, setIsImporting] = useState(false);
	const [lastImportedFiles, setLastImportedFiles] = useState('');
	const importedFilesMatchCurrentFiles =
		!!importResult && lastImportedFiles === getFingerprintOfImportedFiles(currentFiles);
	const isImportDisabled = !hasDocumentToImport || incompleteUploads.length > 0 || isImporting;
	const { doc, warnings = [], error } = importResult;

	const handleFinishImport = () => {
		importDocToEditor(editorChangeObject.view, doc, updateLocalData);
		onClose();
	};

	const handleStartImportTask = () => {
		setIsImporting(true);
		apiFetch('/api/import', {
			method: 'POST',
			body: JSON.stringify({
				sourceFiles: currentFiles,
				useNewImporter: true,
			}),
		})
			.then((taskId) => pingTask(taskId, 1000))
			.then((result) => {
				setIsImporting(false);
				setImportResult(result);
				setLastImportedFiles(getFingerprintOfImportedFiles(currentFiles));
			})
			.catch((err) => setImportResult({ error: err.toString }));
	};

	const renderContentInDropzone = (fn) => {
		return (
			<Dropzone
				accept={acceptedFileTypes}
				onDrop={(files) => files.map(addFile)}
				children={fn}
			/>
		);
	};

	const renderFormatTooltip = () => {
		const formatsNode = (
			<ul className="supported-formats-tooltip">
				<li>
					Supports <i>documents</i> in these formats: {documentExtensions.join(', ')}. You
					can also use one or more documents as <i>supplements</i> to be passed to the
					converter, for instance if your document is a .tex file and relies on one or
					more other .tex files.
				</li>
				<li>
					Supports <i>bibliographies</i> in these formats:{' '}
					{bibliographyExtensions.join(', ')}.
				</li>
				<li>
					Supports all image formats, though you may wish to convert your images to a
					format with wide browser support.
				</li>
			</ul>
		);
		return (
			<React.Fragment>
				<Tooltip content={formatsNode}>
					<span className={Classes.TOOLTIP_INDICATOR}>What formats are supported?</span>
				</Tooltip>
				<div className="screenreader-only">{formatsNode}</div>
			</React.Fragment>
		);
	};

	const renderImportResult = () => {
		if (error) {
			return (
				<Callout className="import-result" title="Import error" intent="danger">
					{error.toString()}
				</Callout>
			);
		}
		if (doc) {
			const missingImages = warnings
				.filter((w) => w.type === 'missingImage')
				.map((w) => w.path);
			const missingCitations = warnings
				.filter((w) => w.type === 'missingCitation')
				.map((w) => w.id);

			if (missingImages.length > 0 || missingCitations.length > 0) {
				return (
					<Callout
						aria-live="assertive"
						className="import-result"
						title="Import warnings"
						intent="warning"
					>
						<ul>
							{missingImages.length > 0 && (
								<li>
									<i>
										Your document contains references to these images, which you
										may wish to upload:
									</i>{' '}
									{missingImages.join(', ')}.
								</li>
							)}
							{missingCitations.length > 0 && (
								<li>
									<i>
										Your document contains references to bibliography entries
										with these IDs:
									</i>{' '}
									{missingCitations.join(', ')}. You may wish to upload a .bib
									file.
								</li>
							)}
						</ul>
					</Callout>
				);
			}
			return (
				<Callout
					aria-live="polite"
					className="import-result"
					title="Import succeeded"
					intent="success"
				/>
			);
		}
		return null;
	};

	return (
		<Drawer
			className="file-import-dialog-component"
			title="Import to Pub"
			isOpen={isOpen}
			onClose={onClose}
			canOutsideClickClose={false}
		>
			<div className={Classes.DRAWER_BODY}>
				<div className={Classes.DIALOG_BODY}>
					{!isImporting &&
						renderContentInDropzone(({ getRootProps, getInputProps }) => (
							<div {...getRootProps()} className="drop-area">
								<Icon icon="paperclip" iconSize={50} className="drop-area-icon" />
								Click here or drag in files to upload them
								<div className="supported-formats">{renderFormatTooltip()}</div>
								<input {...getInputProps()} multiple />
							</div>
						))}
					{!isImporting &&
						renderContentInDropzone(({ getRootProps, getInputProps }) => (
							<div {...getRootProps()} className="drop-area directory-drop-area">
								Or, click here to upload an entire directory
								<input {...getInputProps()} webkitdirectory="" />
							</div>
						))}
					{isImporting && (
						<div className="drop-area in-progress">
							<Spinner size={50} className="drop-area-icon" />
							<span aria-live="assertive">Importing your document...</span>
						</div>
					)}
					{renderImportResult()}
					<div className="files-listing">
						<div className="screenreader-only" aria-live="polite">
							{incompleteUploads.length > 0
								? `${currentFiles.length - incompleteUploads.length} of ${
										currentFiles.length
								  } files uploaded.`
								: `${currentFiles.length} files uploaded.`}
						</div>
						{currentFiles.map((file, index) => (
							<FileImportEntry
								// eslint-disable-next-line react/no-array-index-key
								key={index}
								file={file}
								onDelete={() => deleteFileById(file.id)}
								onLabelFile={(label) => labelFileById(file.id, label)}
							/>
						))}
					</div>
				</div>
			</div>
			<div className={Classes.DRAWER_FOOTER}>
				<ButtonGroup>
					<Button onClick={onClose}>Cancel</Button>
					{(!doc || !importedFilesMatchCurrentFiles) && (
						<Button
							intent="primary"
							icon={doc ? 'refresh' : 'import'}
							onClick={handleStartImportTask}
							disabled={isImportDisabled}
						>
							{doc ? 'Retry import' : 'Import'}
						</Button>
					)}
					{doc && importedFilesMatchCurrentFiles && (
						<Button
							intent="success"
							icon="tick"
							onClick={handleFinishImport}
							disabled={isImporting}
						>
							Complete import
						</Button>
					)}
				</ButtonGroup>
			</div>
		</Drawer>
	);
};

FileImportDialog.propTypes = propTypes;
export default FileImportDialog;
