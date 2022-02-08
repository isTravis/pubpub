import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import nodePandoc from 'node-pandoc';
import { FileResult } from 'tmp-promise';
import { fromProsemirror, emitPandocJson } from '@pubpub/prosemirror-pandoc';
import dateFormat from 'dateformat';

import { DocJson } from 'types';
import { editorSchema, getReactedDocFromJson, Note } from 'client/components/Editor';
import { getPathToCslFileForCitationStyleKind } from 'server/utils/citations';
import { PandocTarget } from 'utils/export/formats';

import { rules } from '../import/rules';
import { getTmpFileForExtension } from './util';
import { NotesData, PubMetadata, PandocFlag } from './types';
import { runTransforms } from './transforms';
import {
	getPandocNotesByHash,
	getCslJsonForPandocNotes,
	getHashForNote,
	PandocNotes,
} from './notes';

const formatToTemplateExtension = {
	epub: 'epub3',
};

const getTemplatePath = (pandocTarget: string) => {
	const targetExtension = formatToTemplateExtension[pandocTarget] || pandocTarget;
	return path.join(__dirname, 'templates', `default.${targetExtension}`);
};

const createPandocArgs = (
	pandocTarget: PandocTarget,
	pandocFlags: PandocFlag[],
	tmpFilePath: string,
	metadataFilePath?: string,
	bibliographyFilePath?: string,
) => {
	// pandoc inexplicably does not include a default template for docx or odt
	const template = pandocTarget !== 'docx' && pandocTarget !== 'odt' && pandocTarget !== 'json';
	const targetPlusFlags =
		pandocTarget + pandocFlags.map((f) => `${f.enabled ? '+' : '-'}${f.name}`).join('');
	return [
		['-f', 'json'],
		['-t', targetPlusFlags],
		['-o', tmpFilePath],
		template && [`--template=${getTemplatePath(pandocTarget)}`],
		metadataFilePath && [`--metadata-file=${metadataFilePath}`],
		bibliographyFilePath && [`--bibliography=${bibliographyFilePath}`],
		['--citeproc'],
	]
		.filter((x): x is string[] => !!x)
		.reduce((acc, next) => [...acc, ...next], []);
};

const createCslJsonBibliographyFile = async (pandocNotes: PandocNotes) => {
	const cslJson = getCslJsonForPandocNotes(pandocNotes);
	const file = await getTmpFileForExtension('json');
	fs.writeFileSync(file.path, JSON.stringify(cslJson));
	return file.path;
};

const createYamlMetadataFile = async (pubMetadata: PubMetadata, pandocTarget: PandocTarget) => {
	const {
		title,
		slug,
		attributions,
		publishedDateString,
		primaryCollectionMetadata,
		communityTitle,
		publisher,
		doi,
		citationStyle,
		license,
	} = pubMetadata;
	const cslFile = getPathToCslFileForCitationStyleKind(citationStyle);
	const formattedAttributions = attributions.map((attr) => {
		if (pandocTarget === 'jats') {
			const publicEmail = 'publicEmail' in attr.user ? attr.user.publicEmail : null;
			return {
				...(attr.user.lastName && { surname: attr.user.lastName }),
				...(attr.user.firstName && { 'given-names': attr.user.firstName }),
				...(publicEmail && { email: publicEmail }),
				...(attr.user.orcid && { orcid: attr.user.orcid }),
			};
		}
		return attr.user.fullName;
	});
	const metadata = YAML.stringify({
		title,
		author: formattedAttributions,
		...(publishedDateString && {
			date: {
				day: dateFormat(publishedDateString, 'dd'),
				month: dateFormat(publishedDateString, 'mm'),
				year: dateFormat(publishedDateString, 'yy'),
			},
		}),
		journal: {
			title: communityTitle,
			...(primaryCollectionMetadata && {
				...(primaryCollectionMetadata.printIssn && {
					pissn: primaryCollectionMetadata.printIssn,
				}),
				...(primaryCollectionMetadata.printIssn && {
					eissn: primaryCollectionMetadata.electronicIssn,
				}),
			}),
			'publisher-name': publisher || communityTitle,
		},
		copyright: {
			text: license.full,
			type: license.short,
			...(license.link && { link: license.link }),
		},
		...(primaryCollectionMetadata && {
			article: {
				...(primaryCollectionMetadata.issue && { issue: primaryCollectionMetadata.issue }),
				...(primaryCollectionMetadata.volume && {
					volume: primaryCollectionMetadata.volume,
				}),
				...(doi && { doi }),
				'elocation-id': slug,
			},
		}),
		'link-citations': true, // See https://github.com/jgm/pandoc/issues/6013#issuecomment-921409135
		...(cslFile && { csl: cslFile }),
	});
	const file = await getTmpFileForExtension('yaml');
	fs.writeFileSync(file.path, metadata);
	return file.path;
};

const createResources = (pandocNotes: PandocNotes) => {
	return {
		note: (note: Pick<Note, 'unstructuredValue' | 'structuredValue'>) => {
			const { structuredValue, unstructuredValue } = note;
			const hash = getHashForNote({ structuredValue, unstructuredValue });
			return pandocNotes[hash];
		},
	};
};

const getPandocFlags = (options: CallPandocOptions): PandocFlag[] => {
	const { notesData, pandocTarget } = options;
	if (pandocTarget === 'jats' && notesData.canUsePandocJatsElementCitations) {
		return [{ name: 'element_citations', enabled: true }];
	}
	return [];
};

type CallPandocOptions = {
	pubDoc: DocJson;
	pandocTarget: PandocTarget;
	pubMetadata: PubMetadata;
	tmpFile: FileResult;
	notesData: NotesData;
};

const reactPubDoc = (options: CallPandocOptions) => {
	const { pubDoc, pubMetadata, notesData } = options;
	return getReactedDocFromJson(
		pubDoc,
		editorSchema,
		notesData.noteManager,
		pubMetadata.nodeLabels,
	);
};

export const callPandoc = async (options: CallPandocOptions) => {
	const { pandocTarget, pubMetadata, tmpFile, notesData } = options;
	const pandocNotes = getPandocNotesByHash(notesData);
	const pubDoc = reactPubDoc(options);
	const metadataFile = await createYamlMetadataFile(pubMetadata, pandocTarget);
	const bibliographyFile = await createCslJsonBibliographyFile(pandocNotes);
	const pandocFlags = getPandocFlags(options);
	const args = createPandocArgs(
		pandocTarget,
		pandocFlags,
		tmpFile.path,
		metadataFile,
		bibliographyFile,
	);
	const preTransformedPandocAst = fromProsemirror(pubDoc, rules, {
		prosemirrorDocWidth: 675,
		resources: createResources(pandocNotes),
	}).asNode();
	const pandocAst = runTransforms(preTransformedPandocAst);
	const pandocJson = emitPandocJson(pandocAst);
	const pandocJsonString = JSON.stringify(pandocJson);
	return new Promise((resolve, reject) => {
		nodePandoc(pandocJsonString, args, (err, result) => {
			if (err && err.message) {
				console.warn(err.message);
			}
			/* This callback is called multiple times */
			/* err is sent multiple times and includes warnings */
			/* So to check if the file generated, check the size */
			/* of the tmp file. */
			const wroteToFile = !!fs.statSync(tmpFile.path).size;
			if (result && wroteToFile) {
				resolve(result);
			}
			if (result && !wroteToFile) {
				reject(new Error('Error in Pandoc'));
			}
		});
	});
};
