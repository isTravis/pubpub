import * as katex from 'katex';
import { RuleSet, pandocUtils, transformUtils, transformers } from '@pubpub/prosemirror-pandoc';

import { editorSchema } from 'client/components/Editor';

const { createAttr, flatten, intersperse, textFromStrSpace, textToStrSpace } = transformUtils;

const {
	bareMarkTransformer,
	docTransformer,
	nullTransformer,
	bareContentTransformer,
	pandocPassThroughTransformer,
	createListTransformer,
	definitionListTransformer,
	bareLeafTransformer,
	pandocQuotedTransformer,
	pandocTableTransformer,
	prosemirrorTableTransformer,
} = transformers;

const {
	getPandocDocForHtmlString,
	htmlStringToPandocBlocks,
	htmlStringToPandocInline,
	pandocBlocksToHtmlString,
	pandocInlineToHtmlString,
	pandocInlineToPlainString,
} = pandocUtils;

const rules = new RuleSet(editorSchema);

// Top-level transformer for a doc
rules.transform('Doc', 'doc', docTransformer);

// Do nothing with nothing
rules.toProsemirrorNode('Null', nullTransformer);

// Paragraphs are paragraphs. So are "Plain", until proven otherwise.
rules.transform('Para | Plain', 'paragraph', bareContentTransformer('Para', 'paragraph'));

// Divs are just boxes of other content
rules.toProsemirrorNode('Div', pandocPassThroughTransformer);

// I'm not really sure what a LineBlock is, but let's just call it a single paragraph
// with some hard breaks thrown in.
rules.toProsemirrorNode('LineBlock', (node, { transform }) => {
	const lines = node.content.map((line) => transform(line).asArray());
	return {
		type: 'paragraph',
		content: flatten(
			intersperse(lines, () => ({
				type: 'hard_break',
			})),
		),
	};
});

rules.transform('CodeBlock', 'code_block', {
	toProsemirrorNode: (node) => {
		return {
			type: 'code_block',
			content: [{ type: 'text', text: node.content }],
		};
	},
	fromProsemirrorNode: (node) => {
		return {
			type: 'CodeBlock',
			content: node.content.map((text) => text.text).join(''),
			attr: createAttr(),
		};
	},
});

rules.transform('BlockQuote', 'blockquote', bareContentTransformer);

// Use a listTransformer to take care of OrderedList and BulletList
const ensureFirstElementIsParagraph = (listItem) => {
	if (listItem.content.length === 0 || listItem.content[0].type !== 'paragraph') {
		listItem.content.unshift({ type: 'paragraph', content: [] });
	}
	return listItem;
};

rules.transform(
	'OrderedList',
	'ordered_list',
	createListTransformer('list_item', ensureFirstElementIsParagraph),
);

rules.transform(
	'BulletList',
	'bullet_list',
	createListTransformer('list_item', ensureFirstElementIsParagraph),
);

rules.toProsemirrorNode('DefinitionList', definitionListTransformer('bullet_list', 'list_item'));

// Tranform headers
rules.transform('Header', 'heading', {
	toProsemirrorNode: (node, { transform }) => {
		return {
			type: 'heading',
			attrs: {
				level: node.level,
				id: node.attr.identifier,
			},
			content: transform(node.content).asArray(),
		};
	},
	fromProsemirrorNode: (node, { transform }) => {
		return {
			type: 'Header',
			level: Number(node.attrs.level),
			attr: createAttr(node.attrs.id),
			content: transform(node.content).asArray(),
		};
	},
});

rules.transform('HorizontalRule', 'horizontal_rule', bareLeafTransformer);

const bareMarkTransformPairs = [
	['Strong', 'strong'],
	['Emph', 'em'],
	['Strikeout', 'strike'],
	['Superscript', 'sup'],
	['Subscript', 'sub'],
	['Code', 'code'],
] as const;

bareMarkTransformPairs.forEach(([from, to]) => rules.transform(from, to, bareMarkTransformer));

rules.transform('Link', 'link', {
	toProsemirrorMark: (link) => {
		return {
			type: 'link',
			attrs: {
				href: link.target.url,
				title: link.target.title,
			},
		};
	},
	fromProsemirrorMark: (link, content) => {
		return {
			type: 'Link',
			attr: createAttr(),
			content,
			target: {
				url: String(link.attrs.href),
				title: String(link.attrs.title),
			},
		};
	},
});

// We don't support small caps right now
rules.toProsemirrorNode('SmallCaps', pandocPassThroughTransformer);

// Tell the transformer how to deal with typical content-level nodes
rules.toProsemirrorNode('(Str | Space)+', (nodes) => {
	return {
		type: 'text',
		text: textFromStrSpace(nodes),
	};
});

// Tell the transformer how to turn Prosemirror text back into Pandoc
rules.fromProsemirrorNode('text', (node) => textToStrSpace(node.text));

// Deal with line breaks
rules.transform('LineBreak', 'hard_break', bareLeafTransformer);
rules.toProsemirrorNode('SoftBreak', nullTransformer);

// Stuff we don't have equivalents for
rules.toProsemirrorNode('Span', pandocPassThroughTransformer);
rules.toProsemirrorNode('Underline', pandocPassThroughTransformer);

// Anything in quotation marks is its own node, to Pandoc
rules.toProsemirrorNode('Quoted', pandocQuotedTransformer);

rules.toProsemirrorNode('RawBlock', (node) => {
	return {
		type: 'paragraph',
		content: [{ type: 'text', text: node.content }],
	};
});

rules.toProsemirrorNode('RawInline', (node) => {
	const { format, content } = node;
	if (format === 'tex') {
		return {
			type: 'equation',
			attrs: {
				value: content,
				html: katex.renderToString(content, {
					displayMode: false,
					throwOnError: false,
				}),
			},
		};
	}
	return { type: 'text', text: content };
});

// These next rules for images don't use transform() because they're not inverses of each other --
// the Prosemirror->Pandoc direction wraps an Image in a Para to make it block-level

rules.toProsemirrorNode('Image', (node, { resource }) => {
	return {
		type: 'image',
		attrs: {
			url: resource(node.target.url),
			altText: pandocInlineToPlainString(node.content),
			// TODO(ian): is there anything we can do about the image size here?
		},
	};
});

rules.fromProsemirrorNode('image', (node) => {
	const maybeAltTextDoc = getPandocDocForHtmlString(node.attrs.altText as string);
	const altTextInlines = maybeAltTextDoc.blocks[0]?.content ?? [];
	const captionBlocks = htmlStringToPandocBlocks(node.attrs.caption as string);
	const imageWrappedInPlain = {
		type: 'Plain',
		content: [
			{
				type: 'Image',
				content: altTextInlines,
				target: {
					url: node.attrs.url.toString(),
					title: '',
				},
				attr: createAttr(node.attrs.id),
			},
		],
	};
	if (captionBlocks.length > 0) {
		return [imageWrappedInPlain, ...captionBlocks];
	}
	return imageWrappedInPlain;
});

rules.transform('Cite', 'citation', {
	toProsemirrorNode: (node, { count }) => {
		const { content } = node;
		const unstructuredValue = pandocInlineToHtmlString(content);
		return {
			type: 'citation',
			attrs: {
				unstructuredValue,
				count: 1 + count('Cite'),
			},
		};
	},
	fromProsemirrorNode: (node, { count, resource }) => {
		const { value: structuredValue, unstructuredValue, html } = node.attrs;
		const inputHtml = (html || unstructuredValue) as string;
		const citationNumber = 1 + count('citation');
		const { id, hash } = resource({ structuredValue, unstructuredValue }, 'note');
		return {
			type: 'Cite',
			content: htmlStringToPandocInline(inputHtml),
			citations: [
				{
					citationPrefix: [],
					citationSuffix: [],
					citationId: id,
					citationHash: parseInt(hash, 16),
					citationNoteNum: citationNumber,
					citationMode: 'NormalCitation',
				},
			],
		};
	},
});

rules.transform('Note', 'footnote', {
	toProsemirrorNode: (node, { count }) => {
		const { content } = node;
		return {
			type: 'footnote',
			attrs: {
				value: pandocBlocksToHtmlString(content),
				count: 1 + count('Note'),
			},
		};
	},
	fromProsemirrorNode: (node, { resource }) => {
		const { value: unstructuredValue, structuredValue } = node.attrs;
		const { html } = resource({ structuredValue, unstructuredValue }, 'note');
		const unstructuredBlocks = unstructuredValue && htmlStringToPandocBlocks(unstructuredValue);
		const structuredBlocks = html && htmlStringToPandocBlocks(html);
		const content = [structuredBlocks, unstructuredBlocks].reduce(
			(acc, next) => [...acc, ...(next || [])],
			[],
		);
		return {
			type: 'Note',
			content,
		};
	},
});

rules.toProsemirrorNode('Math', (node) => {
	const { mathType, content } = node;
	const isDisplay = mathType === 'DisplayMath';
	const prosemirrorType = isDisplay ? 'block_equation' : 'equation';
	return {
		type: prosemirrorType,
		attrs: {
			value: content,
			html: katex.renderToString(content, {
				displayMode: isDisplay,
				throwOnError: false,
			}),
		},
	};
});

rules.fromProsemirrorNode('equation', (node) => {
	return {
		type: 'Math',
		mathType: 'InlineMath',
		content: node.attrs.value.toString(),
	};
});

rules.fromProsemirrorNode('block_equation', (node) => {
	return {
		type: 'Plain',
		content: [
			{
				type: 'Math',
				mathType: 'DisplayMath',
				content: node.attrs.value.toString(),
			},
		],
	};
});

rules.toProsemirrorNode('Table', pandocTableTransformer);
rules.fromProsemirrorNode('table', prosemirrorTableTransformer);

rules.fromProsemirrorNode('reference', (node) => {
	return {
		type: 'Link',
		attr: createAttr(),
		content: textToStrSpace(node.attrs.label),
		target: {
			url: `#${node.attrs.targetId}`,
			title: '',
		},
	};
});

rules.fromProsemirrorNode(
	'file | iframe | video | audio | highlightQuote | citationList | footnoteList | discussion',
	(node) => {
		return {
			type: 'Para',
			content: textToStrSpace(`[${node.type} element]`),
		};
	},
);

rules.validate();

export { rules };
