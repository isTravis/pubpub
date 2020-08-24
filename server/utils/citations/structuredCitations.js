import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Cite from 'citation-js';

import { getNotes } from 'components/Editor';

/* Different styles available here: */
/* https://github.com/citation-style-language/styles */
/* ['apa', 'harvard', 'vancouver'] built-in to citation-js */
const styles = [
	{ name: 'acm-siggraph', path: './citeStyles/acm-siggraph.csl' },
	{ name: 'american-anthro', path: './citeStyles/american-anthropological-association.csl' },
	{ name: 'cell', path: './citeStyles/cell.csl' },
	{ name: 'chicago', path: './citeStyles/chicago-author-date.csl' },
	{ name: 'elife', path: './citeStyles/elife.csl' },
	{ name: 'frontiers', path: './citeStyles/frontiers.csl' },
	{ name: 'mla', path: './citeStyles/modern-language-association.csl' },
	{ name: 'apa-7', path: './citeStyles/apa-7.csl' },
];
const config = Cite.plugins.config.get('@csl');
styles.forEach((style) => {
	const fileString = fs.readFileSync(path.join(__dirname, style.path), { encoding: 'utf8' });
	config.templates.add(style.name, fileString);
});
/* Remove @else/url parser. See Freshdesk ticket #1308. Second term specifies sync/async component.  */
/* https://github.com/citation-js/citation-js/blob/master/packages/core/src/plugins/input/data.js#L90-L97 */
Cite.plugins.input.removeDataParser('@else/url', false);
Cite.plugins.input.removeDataParser('@else/url', true);

const generateFallbackHash = (structuredValue) =>
	crypto
		.createHash('md5')
		.update(structuredValue)
		.digest('base64')
		.substring(0, 10);

const extractAuthorFromApa = (apaStyleCitation) =>
	apaStyleCitation
		.split(',')
		.slice(0, -1)
		.join('');

const getInlineCitation = (citationJson, citationApa, inlineStyle, fallbackValue) => {
	if (inlineStyle === 'author' || inlineStyle === 'authorYear') {
		return inlineStyle === 'author' ? extractAuthorFromApa(citationApa) : citationApa;
	}
	if (inlineStyle === 'label') {
		return (citationJson[0] && citationJson[0]['citation-label']) || fallbackValue;
	}
	return null;
};

const getSingleStructuredCitation = async (structuredInput, citationStyle, inlineStyle) => {
	try {
		const fallbackValue = generateFallbackHash(structuredInput);
		const citationData = await Cite.async(structuredInput);
		if (citationData) {
			const citationJson = citationData.format('data', { format: 'object' });
			const citationHtml = citationData.format('bibliography', {
				template: citationStyle,
				format: 'html',
			});
			const citationApa = citationData.format('citation', {
				template: citationStyle === 'apa-7' ? 'apa-7' : 'apa',
				format: 'text',
			});
			return {
				html: citationHtml,
				json: citationJson,
				inline: getInlineCitation(citationJson, citationApa, inlineStyle, fallbackValue),
			};
		}
		return {
			html: '',
			json: '',
			inline: inlineStyle === 'label' ? `(${fallbackValue})` : null,
		};
	} catch (err) {
		return {
			html: 'Error',
			json: 'Error',
			inline: '(Error)',
			error: true,
		};
	}
};

export const getStructuredCitations = async (
	structuredInputs,
	citationStyle = 'apa',
	inlineStyle = 'count',
) => {
	const structuredCitationsMap = {};
	const structuredValues = await Promise.all(
		structuredInputs.map((structuredInput) =>
			getSingleStructuredCitation(structuredInput, citationStyle, inlineStyle),
		),
	);
	structuredInputs.forEach((input, index) => {
		structuredCitationsMap[input] = structuredValues[index];
	});
	return structuredCitationsMap;
};

export const getStructuredCitationsForPub = (pubData, pubDocument) => {
	const { initialDoc, citationStyle, citationInlineStyle } = pubData;

	const { footnotes, citations } = initialDoc
		? getNotes(pubDocument)
		: { footnotes: [], citations: [] };

	const structuredValuesInDoc = [
		...new Set([...footnotes, ...citations].map((note) => note.structuredValue)),
	];
	return getStructuredCitations(structuredValuesInDoc, citationStyle, citationInlineStyle);
};
