/* eslint-disable no-restricted-syntax */
import path from 'path';

import { generateAssetKeyForFile, uploadFileToAssetStore, getUrlForAssetKey } from './assetStore';

type MissingImageWarning = {
	type: 'missingImage';
	path: string;
	sourceFile?: string;
	error?: string;
	unableToFind?: true;
	unableToUpload?: true;
};

type MissingCitationWarning = {
	type: 'missingCitation';
	id: string;
};

export type ResourceWarning = MissingImageWarning | MissingCitationWarning;

const getSourceFileForResource = (resourcePath, sourceFiles, document) => {
	const possibleSourceFiles = sourceFiles.filter((file) => file.clientPath);
	// First, try to find a file in the uploads with the exact path
	for (const sourceFile of possibleSourceFiles) {
		if (resourcePath === sourceFile.clientPath) {
			return sourceFile;
		}
	}
	// Then, try to find a file in the uploads with the same relative path
	const documentContainer = path.dirname(document.clientPath);
	for (const sourceFile of possibleSourceFiles) {
		const relativePathWithExtension = path.relative(documentContainer, sourceFile.clientPath);
		const relativePathSansExtension = relativePathWithExtension
			.split('.')
			.slice(0, -1)
			.join('.');
		if (
			resourcePath === relativePathWithExtension ||
			resourcePath === relativePathSansExtension
		) {
			return sourceFile;
		}
	}
	// Having failed, just look for a source file with the same name as the requested file.
	const baseName = path.basename(resourcePath);
	for (const sourceFile of possibleSourceFiles) {
		if (path.basename(sourceFile.clientPath) === baseName) {
			return sourceFile;
		}
	}
	return null;
};

const uploadPendingSourceFile = async (sourceFile, newAssetKey) => {
	const { tmpPath } = sourceFile;
	if (tmpPath) {
		return uploadFileToAssetStore(tmpPath, newAssetKey);
	}
	throw new Error('Pending source file must have a tmpPath');
};

export const createTransformResources = ({ sourceFiles, document, bibliographyItems }) => {
	const warnings: ResourceWarning[] = [];
	const pendingUploadsMap = new Map();

	const getAssetKeyForLocalResource = (localResource) => {
		const sourceFile =
			getSourceFileForResource(localResource, sourceFiles, document) ||
			getSourceFileForResource(unescape(localResource), sourceFiles, document);
		if (sourceFile) {
			if (sourceFile.assetKey) {
				return sourceFile.assetKey;
			}
			const newKey = generateAssetKeyForFile(sourceFile.clientPath);
			pendingUploadsMap.set(sourceFile, newKey);
			return newKey;
		}
		return null;
	};

	const uploadPendingResources = () =>
		Promise.all(
			[...pendingUploadsMap.entries()].map(([sourceFile, newAssetKey]) =>
				uploadPendingSourceFile(sourceFile, newAssetKey).catch((error) =>
					warnings.push({
						type: 'missingImage',
						unableToUpload: true,
						error: error.message,
						sourceFile,
						path: sourceFile.tmpPath || sourceFile.remoteUrl,
					}),
				),
			),
		);

	const citation = (id: string) => {
		const item = bibliographyItems[id];
		if (item) {
			return item;
		}
		warnings.push({ type: 'missingCitation', id });
		return { structuredValue: '', unstructuredValue: '' };
	};

	const image = (url: string) => {
		const assetKey = getAssetKeyForLocalResource(url);
		if (assetKey) {
			return getUrlForAssetKey(assetKey);
		}
		warnings.push({
			type: 'missingImage',
			path: url,
			unableToFind: true,
		});
		return url;
	};

	return {
		citation,
		image,
		getWarnings: () => warnings,
		uploadPendingResources,
	};
};
