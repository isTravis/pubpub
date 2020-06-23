/* eslint-disable no-restricted-syntax */
import path from 'path';
import { spawnSync } from 'child_process';
import { parsePandocJson, fromPandoc, setPandocApiVersion } from '@pubpub/prosemirror-pandoc';

import { extensionToPandocFormat } from 'shared/import/formats';

import pandocRules from './rules';
import { downloadAndConvertFiles } from './download';
import { extractBibliographyItems } from './bibliography';
import { uploadExtractedMedia } from './extractedMedia';
import { extensionFor } from './util';
import { runTransforms } from './transforms/runTransforms';
import { getProposedMetadata } from './metadata';
import { getTmpDirectoryPath } from './tmpDirectory';
import { createResourceTransformer } from './resources';

setPandocApiVersion([1, 20]);

const dataRoot = process.env.NODE_ENV === 'production' ? '/app/.apt/usr/share/pandoc/data ' : '';

const createPandocArgs = (pandocFormat, tmpDirPath) => {
	const shouldExtractMedia = ['odt', 'docx', 'epub'].includes(pandocFormat);
	return [
		dataRoot && [`--data-dir=${dataRoot}`],
		['-f', pandocFormat],
		['-t', 'json'],
		shouldExtractMedia && [`--extract-media=${path.join(tmpDirPath, 'media')}`],
	]
		.filter((x) => x)
		.reduce((acc, next) => [...acc, ...next], []);
};

const callPandoc = (tmpDirPath, files, args) => {
	const proc = spawnSync('pandoc', [...files, ...args], {
		maxBuffer: 1024 * 1024 * 25,
		cwd: tmpDirPath,
	});
	const output = proc.stdout.toString();
	const error = proc.stderr.toString();
	return { output: output, error: error };
};

export const categorizeSourceFiles = (sourceFiles) => {
	const preambles = sourceFiles.filter((file) => file.label === 'preamble');
	const document = sourceFiles.find((file) => file.label === 'document');
	const bibliography = sourceFiles.find((file) => file.label === 'bibliography');
	const supplements = sourceFiles.filter((file) => file.label === 'supplement');
	if (!document) {
		throw new Error('No target document specified.');
	}
	return {
		preambles: preambles,
		document: document,
		bibliography: bibliography,
		supplements: supplements,
	};
};

const getPandocAst = ({
	documentPath,
	preamblePaths,
	supplementPaths,
	tmpDirPath,
	importerFlags,
}) => {
	const extension = extensionFor(documentPath);
	const pandocFormat = importerFlags.pandocFormat || extensionToPandocFormat[extension];
	if (!pandocFormat) {
		throw new Error(`Cannot find Pandoc format for .${extension} file.`);
	}
	let pandocRawAst;
	let pandocError;
	try {
		const pandocResult = callPandoc(
			path.dirname(documentPath),
			[...preamblePaths, documentPath, ...supplementPaths],
			createPandocArgs(pandocFormat, tmpDirPath),
		);
		pandocError = pandocResult.error;
		pandocRawAst = JSON.parse(pandocResult.output);
	} catch (err) {
		throw new Error(
			`Conversion from ${path.basename(
				document.clientPath,
			)} failed. Pandoc says: ${pandocError}`,
		);
	}
	return runTransforms(parsePandocJson(pandocRawAst), importerFlags);
};

export const importFiles = async ({ sourceFiles, tmpDirPath, importerFlags = {} }) => {
	const { keepStraightQuotes, skipJatsBibExtraction } = importerFlags;
	const { preambles, document, bibliography, supplements } = categorizeSourceFiles(sourceFiles);
	const pandocAst = getPandocAst({
		documentPath: document.tmpPath,
		preamblePaths: preambles.map((p) => p.tmpPath),
		supplementPaths: supplements.map((s) => s.tmpPath),
		tmpDirPath: tmpDirPath,
		importerFlags: importerFlags,
	});
	const [extractedMedia, bibliographyItems] = await Promise.all([
		uploadExtractedMedia(tmpDirPath),
		extractBibliographyItems({
			bibliography: bibliography,
			document: document,
			extractBibFromJats: !skipJatsBibExtraction,
		}),
	]);
	const resourceTransformer = createResourceTransformer({
		sourceFiles: [...sourceFiles, ...extractedMedia],
		document: document,
		bibliographyItems: bibliographyItems,
	});
	const prosemirrorDoc = fromPandoc(pandocAst, pandocRules, {
		resource: resourceTransformer.getResource,
		useSmartQuotes: !keepStraightQuotes,
	}).asNode();
	const [proposedMetadata] = await Promise.all([
		getProposedMetadata(pandocAst.meta),
		resourceTransformer.uploadPendingResources(),
	]);
	return {
		doc: prosemirrorDoc,
		warnings: resourceTransformer.getWarnings(),
		proposedMetadata: proposedMetadata,
	};
};

export const importTask = async ({ sourceFiles: clientSourceFilesList, importerFlags }) => {
	const tmpDirPath = await getTmpDirectoryPath();
	const sourceFiles = await downloadAndConvertFiles(clientSourceFilesList, tmpDirPath);
	return importFiles({ sourceFiles: sourceFiles, importerFlags: importerFlags }).catch(
		(error) => ({
			error: {
				message: error.toString(),
				stack: error.stack.toString(),
			},
		}),
	);
};
