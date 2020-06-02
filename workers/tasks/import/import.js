/* eslint-disable no-restricted-syntax */
import path from 'path';
import { spawnSync } from 'child_process';
import { parsePandocJson, fromPandoc, setPandocApiVersion } from '@pubpub/prosemirror-pandoc';

import pandocRules from './rules';
import { downloadAndConvertFiles } from './download';
import { extractBibliographyItems } from './bibliography';
import { uploadExtractedMedia } from './extractedMedia';
import { extensionFor } from './util';
import { runTransforms } from './transforms/runTransforms';
import { getProposedMetadata } from './metadata';

setPandocApiVersion([1, 20]);

export const extensionToPandocFormat = {
	docx: 'docx',
	epub: 'epub',
	html: 'html',
	md: 'markdown',
	odt: 'odt',
	txt: 'markdown_strict',
	xml: 'jats',
	tex: 'latex',
};

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

const createUrlGetter = (sourceFiles, documentLocalPath) => (resourcePath) => {
	// First, try to find a file in the uploads with the exact path
	for (const { localPath, url } of sourceFiles) {
		if (resourcePath === localPath) {
			return url;
		}
	}
	// First, try to find a file in the uploads with the same relative path
	const documentContainer = path.dirname(documentLocalPath);
	for (const { localPath, url } of sourceFiles) {
		if (resourcePath === path.relative(documentContainer, localPath)) {
			return url;
		}
	}
	// Having failed, just look for a source file with the same name as the requested file.
	const baseName = path.basename(resourcePath);
	for (const { localPath, url } of sourceFiles) {
		if (path.basename(localPath) === baseName) {
			return url;
		}
	}
	return null;
};

const createTransformResourceGetter = (getUrlByLocalPath, getBibliographyItemById, warnings) => (
	resource,
	context,
) => {
	if (context === 'citation') {
		const item = getBibliographyItemById(resource);
		if (item) {
			return item;
		}
		warnings.push({ type: 'missingCitation', id: resource });
		return { structuredValue: '', unstructuredValue: '' };
	}
	if (context === 'image') {
		if (resource.startsWith('http://') || resource.startsWith('https://')) {
			return resource;
		}
		const url = getUrlByLocalPath(resource);
		if (url) {
			return `https://assets.pubpub.org/${url}`;
		}
		warnings.push({ type: 'missingImage', path: resource });
		return resource;
	}
	return resource;
};

const categorizeSourceFiles = (sourceFiles) => {
	return {
		document: sourceFiles.find((file) => file.label === 'document'),
		bibliography: sourceFiles.find((file) => file.label === 'bibliography'),
		supplements: sourceFiles.filter((file) => file.label === 'supplement'),
	};
};

const importFiles = async ({ sourceFiles, importerFlags = {} }) => {
	const { keepStraightQuotes, skipJatsBibExtraction } = importerFlags;
	const { document, bibliography, supplements } = categorizeSourceFiles(sourceFiles);
	if (!document) {
		throw new Error('No target document specified.');
	}
	const extension = extensionFor(document.localPath);
	const pandocFormat = extensionToPandocFormat[extension];
	if (!pandocFormat) {
		throw new Error(`Cannot find Pandoc format for .${extension} file.`);
	}
	const { tmpDir, getTmpPathByLocalPath } = await downloadAndConvertFiles(sourceFiles);
	let pandocRawAst;
	let pandocError;
	try {
		const pandocResult = callPandoc(
			tmpDir.path,
			[document, ...supplements].map((file) => getTmpPathByLocalPath(file.localPath)),
			createPandocArgs(pandocFormat, tmpDir.path),
		);
		pandocError = pandocResult.error;
		pandocRawAst = JSON.parse(pandocResult.output);
	} catch (err) {
		throw new Error(
			`Conversion from ${path.basename(
				document.localPath,
			)} failed. Pandoc says: ${pandocError}`,
		);
	}
	const extractedMedia = await uploadExtractedMedia(tmpDir);
	const pandocAst = runTransforms(parsePandocJson(pandocRawAst), importerFlags);
	const getBibliographyItemById = await extractBibliographyItems({
		bibliographyTmpPath: bibliography && getTmpPathByLocalPath(bibliography.localPath),
		documentTmpPath: !skipJatsBibExtraction && getTmpPathByLocalPath(document.localPath),
	});
	const getUrlByLocalPath = createUrlGetter(
		[...sourceFiles, ...extractedMedia],
		document.localPath,
	);
	const warnings = [];
	const prosemirrorDoc = fromPandoc(pandocAst, pandocRules, {
		resource: createTransformResourceGetter(
			getUrlByLocalPath,
			getBibliographyItemById,
			warnings,
		),
		useSmartQuotes: !keepStraightQuotes,
	}).asNode();
	const proposedMetadata = await getProposedMetadata(pandocAst.meta);
	return { doc: prosemirrorDoc, warnings: warnings, proposedMetadata: proposedMetadata };
};

export const importTask = ({ sourceFiles, importerFlags }) =>
	importFiles({ sourceFiles: sourceFiles, importerFlags: importerFlags }).catch((error) => ({
		error: {
			message: error.toString(),
			stack: error.stack.toString(),
		},
	}));
