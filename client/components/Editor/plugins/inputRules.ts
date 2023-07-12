import { Fragment, MarkType, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import {
	inputRules,
	wrappingInputRule,
	textblockTypeInputRule,
	smartQuotes,
	emDash,
	ellipsis,
	InputRule,
} from 'prosemirror-inputrules';

import { makeBlockMathInputRule, REGEX_BLOCK_MATH_DOLLARS } from '@benrbray/prosemirror-math';

// : (NodeType) → InputRule
// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
const blockQuoteRule = (nodeType) => wrappingInputRule(/^\s*>\s$/, nodeType);

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
const orderedListRule = (nodeType) =>
	wrappingInputRule(
		/^(\d+)\.\s$/,
		nodeType,
		(match) => ({ order: +match[1] }),
		(match, node) => node.childCount + node.attrs.order === +match[1],
	);

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
const bulletListRule = (nodeType) => wrappingInputRule(/^\s*([-+*])\s$/, nodeType);

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
const codeBlockRule = (nodeType) => textblockTypeInputRule(/^```$/, nodeType);

// : (NodeType) → InputRule
// Given an inline code mark type, returns an input rule that turns text wrapped in single
// backticks into inline code.
const inlineCodeRule = (markType) =>
	new InputRule(
		// \040 is the space character
		/`([^`]+)`\040/,
		// @ts-expect-error FIXME: Mismatch between RegExpMatchArray here and string[] in prosemirror-inputrules
		(state: EditorState, match: RegExpMatchArray, start: number, end: number) => {
			const [_, content] = match;
			const fragment = Fragment.fromArray([
				state.schema.text(content, [state.schema.mark(markType)]),
				state.schema.text(' '),
			]);
			return state.tr.replaceWith(start, end, fragment);
		},
	);

// : (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
const headingRule = (nodeType, maxLevel) =>
	textblockTypeInputRule(new RegExp(`^(#{1,${maxLevel}})\\s$`), nodeType, (match) => ({
		level: match[1].length,
	}));

// : (NodeType) → InputRule
// Given a math block node type, returns an input rule that turns a
// textblock starting with one dollar sign into an inline math node.
const inlineMathRule = (
	nodeType: NodeType,
	excludingAncestorNodeTypes: NodeType[],
	excludingMarkTypes: MarkType[] = [],
) =>
	new InputRule(
		// \040 is the space character
		/\$([^$]+?)\$\040$/,
		// @ts-expect-error FIXME: Mismatch between RegExpMatchArray here and string[] in prosemirror-inputrules
		(state: EditorState, matches: RegExpMatchArray, start: number, end: number) => {
			const [_, match] = matches;
			const resolvedStart = state.doc.resolve(start + 1); // +1 to capture non-inclusive marks
			const resolvedEnd = state.doc.resolve(end - 1); // -1 to capture non-inclusive marks
			const marksForRange = [...resolvedStart.marks(), ...resolvedEnd.marks()];
			if (marksForRange.some((mark) => excludingMarkTypes.includes(mark.type))) {
				return null;
			}
			for (let i = 0; i < resolvedStart.depth + 1; i++) {
				const parentAtDepth = resolvedStart.node(i);
				if (excludingAncestorNodeTypes.includes(parentAtDepth.type)) {
					return null;
				}
			}
			const newFragment = Fragment.fromArray([
				nodeType.create(null, nodeType.schema.text(match)),
				nodeType.schema.text(' '),
			]);
			return state.tr.replaceWith(start, end, newFragment);
		},
	);

// : (NodeType) → InputRule
// Given a math block node type, returns an input rule that turns a
// textblock starting with two dollar signs into a math block.
const blockMathRule = (nodeType) => makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, nodeType);

const emailOrUriRegexBase =
	'(?<emailOrUri>(?:(?:(https|http|ftp)+)://)?(?:\\S+(?::\\S*)?(?<atSign>@))?(?:(?:([a-z0-9][a-z0-9-]*)?[a-z0-9]+)(?:\\.(?:[a-z0-9-])*[a-z0-9]+)*(?:\\.(?:[a-z]{2,})(:\\d{1,5})?))(?:/[^\\s]*)?)';

// Export a version of the regex and handler so that we can reuse this logic in a custom command
// mapped to the `enter` key, because input rules don't work across nodes
export const EMAIL_OR_URI_REGEX = new RegExp(`${emailOrUriRegexBase}$`);

const EMAIL_OR_URI_REGEX_WITH_SPACE = new RegExp(`${emailOrUriRegexBase}(?<whitespace>\\s)$`);

// Determine if the matched content is a url or an email and add a link mark to it
export const linkRuleHandler = (
	markType: MarkType,
	appendWhitespace = false,
	transaction?: Transaction,
) => {
	return (state: EditorState, match: RegExpMatchArray, start: number, end: number) => {
		const resolvedStart = state.doc.resolve(start);
		const tr = transaction ?? state.tr;
		if (!resolvedStart.parent.type.allowsMarkType(markType)) {
			return tr;
		}
		const emailOrUri = match.groups!.emailOrUri;

		const href = `${match.groups!.atSign ? 'mailto:' : ''}${emailOrUri}`;

		const link = state.schema.text(emailOrUri, [state.schema.mark(markType, { href })]);

		const content = [link];

		if (appendWhitespace) {
			const whitespace = state.schema.text(match.groups!.whitespace);
			content.push(whitespace);
		}

		return tr.replaceWith(start, end, content);
	};
};

// // : (NodeType) → InputRule
// Given a link mark type, returns an input rule that wraps emails and URLs in link marks.
// Typing www.example.com in the editor will produce <a href="www.example.com">www.example.com</a>
// and typing email@example.com will produce <a href="mailto:email@example.com">email@example.com</a>
function linkRule(markType: MarkType) {
	// @ts-expect-error FIXME: Mismatch between RegExpMatchArray in linkRuleHandler and string[] in prosemirror-inputrules
	return new InputRule(EMAIL_OR_URI_REGEX_WITH_SPACE, linkRuleHandler(markType, true));
}

// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
export default (schema) => {
	const rules = smartQuotes.concat(ellipsis, emDash);
	if (schema.marks.link) rules.unshift(linkRule(schema.marks.link));
	if (schema.nodes.blockquote) rules.push(blockQuoteRule(schema.nodes.blockquote));
	if (schema.nodes.ordered_list) rules.push(orderedListRule(schema.nodes.ordered_list));
	if (schema.nodes.bullet_list) rules.push(bulletListRule(schema.nodes.bullet_list));
	if (schema.nodes.code_block) rules.push(codeBlockRule(schema.nodes.code_block));
	if (schema.nodes.heading) rules.push(headingRule(schema.nodes.heading, 6));
	if (schema.nodes.math_inline)
		rules.push(
			inlineMathRule(
				schema.nodes.math_inline,
				[schema.nodes.math_inline, schema.nodes.math_display, schema.nodes.code_block],
				[schema.marks.code],
			),
		);
	if (schema.nodes.math_display) rules.push(blockMathRule(schema.nodes.math_display));
	if (schema.marks.code) rules.push(inlineCodeRule(schema.marks.code));
	return inputRules({ rules });
};
