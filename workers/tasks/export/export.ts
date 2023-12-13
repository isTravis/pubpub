import { getExportFormatDetails } from 'utils/export/formats';
import { getPubDraftDoc } from 'server/utils/firebaseAdmin';
import { Maybe } from 'types';

import { expect } from 'utils/assert';
import { defer } from 'server/utils/deferred';
import { schedulePurge } from 'utils/caching/schedulePurge';
import { purgeSurrogateTag } from 'utils/caching/purgeSurrogateTag';
import { renderStaticHtml } from './html';
import { getPubMetadata } from './metadata';
import { getNotesData } from './notes';
import { exportWithPaged } from './paged';
import { exportWithPandoc } from './pandoc';
import {
	getExportById,
	getTmpFileForExtension,
	uploadDocument,
	writeToFile,
	assignFileToExportById,
} from './util';

export const exportTask = async ({ exportId }: { exportId: string }) => {
	const { pubId, format, historyKey } = expect(await getExportById(exportId));
	const { extension, pandocTarget, pagedTarget } = getExportFormatDetails(format);
	const tmpFile = await getTmpFileForExtension(extension);
	const pubMetadata = await getPubMetadata(pubId);
	const { doc: pubDoc } = await getPubDraftDoc(pubId, historyKey);
	const notesData = await getNotesData(pubMetadata, pubDoc);

	let url: Maybe<string>;

	if (pandocTarget) {
		await exportWithPandoc({
			pubDoc,
			pubMetadata,
			tmpFile,
			pandocTarget,
			notesData,
		});
	} else {
		const staticHtml = await renderStaticHtml({
			pubDoc,
			notesData,
			pubMetadata,
		});
		if (pagedTarget) {
			url = (await exportWithPaged(staticHtml)).url;
		} else {
			await writeToFile(staticHtml, tmpFile);
		}
	}
	if (url === undefined) {
		url = await uploadDocument(pubId, tmpFile, extension);
	}
	await assignFileToExportById(exportId, url);

	//	defer(async () => {
	const { hostname } = pubMetadata;

	// console.log('purginggg');
	// await schedulePurge(hostname);
	//	});
	return { url, hostname };
};
