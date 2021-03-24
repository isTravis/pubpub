import {
	alignTextCenter,
	alignTextLeft,
	alignTextRight,
	blockquoteToggle,
	bulletListToggle,
	codeToggle,
	emToggle,
	heading1Toggle,
	heading2Toggle,
	linkToggle,
	orderedListToggle,
	strikethroughToggle,
	strongToggle,
	subscriptToggle,
	superscriptToggle,
} from '../Editor/commands';
import { getCurrentNodeLabels, EditorChangeObject } from '../Editor';

import {
	ControlsEquation,
	ControlsFootnoteCitation,
	ControlsLink,
	ControlsReference,
	ControlsReferencePopover,
	ControlsMedia,
	ControlsTable,
} from './controlComponents';
import MediaButton from './FormattingBarMediaButton';
import { positionNearSelection, positionNearLink } from './positioning';
import { FormattingBarButtonData, FormattingBarPopoverCondition } from './types';

const triggerOnClick = (changeObject) => {
	const { latestDomEvent } = changeObject;
	return latestDomEvent?.type === 'click';
};

const nodeControls = (component, indicatedNodeType, restOptions?) => {
	const indicatedTypes = Array.isArray(indicatedNodeType)
		? indicatedNodeType
		: [indicatedNodeType];
	return {
		showCloseButton: true,
		enterKeyTriggers: true,
		captureFocusOnMount: false,
		component,
		trigger: triggerOnClick,
		show: (editorChangeObject) => !!editorChangeObject.selectedNode,
		indicate: (editorChangeObject) => {
			const { selectedNode } = editorChangeObject;
			return selectedNode && indicatedTypes.some((type) => type === selectedNode.type.name);
		},
		...restOptions,
	};
};

const showOrTriggerTable = (editorChangeObject) => {
	const { selectionInTable, selection } = editorChangeObject;
	return (
		selectionInTable &&
		triggerOnClick(editorChangeObject) &&
		(selection.empty || selection.$anchorCell)
	);
};

export const alignLeft: FormattingBarButtonData = {
	key: 'align-left',
	title: 'Align left',
	icon: 'align-left',
	command: alignTextLeft,
};

export const alignCenter: FormattingBarButtonData = {
	key: 'align-center',
	title: 'Align center',
	icon: 'align-center',
	command: alignTextCenter,
};

export const alignRight: FormattingBarButtonData = {
	key: 'align-right',
	title: 'Align right',
	icon: 'align-right',
	command: alignTextRight,
};

export const strong: FormattingBarButtonData = {
	key: 'strong',
	title: 'Bold',
	icon: 'bold',
	isToggle: true,
	command: strongToggle,
};

export const em: FormattingBarButtonData = {
	key: 'em',
	title: 'Italic',
	icon: 'italic',
	isToggle: true,
	command: emToggle,
};

export const link: FormattingBarButtonData = {
	key: 'link',
	title: 'Link',
	icon: 'link',
	isToggle: true,
	command: linkToggle,
	controls: {
		component: ControlsLink,
		indicate: (changeObject) => !!changeObject.activeLink,
		trigger: (changeObject) => {
			const { latestDomEvent } = changeObject;
			return (
				(latestDomEvent && latestDomEvent.metaKey && latestDomEvent.key === 'k') ||
				triggerOnClick(changeObject)
			);
		},
		show: (changeObject) => !!changeObject.activeLink,
		position: positionNearLink,
	},
};

export const bulletList: FormattingBarButtonData = {
	key: 'bullet-list',
	title: 'Bullet List',
	icon: 'list-ul',
	command: bulletListToggle,
};

export const numberedList: FormattingBarButtonData = {
	key: 'ordered-list',
	title: 'Ordered List',
	icon: 'list-ol',
	command: orderedListToggle,
};

export const blockquote: FormattingBarButtonData = {
	key: 'blockquote',
	title: 'Blockquote',
	icon: 'citation',
	command: blockquoteToggle,
};

export const heading1: FormattingBarButtonData = {
	key: 'heading1',
	title: 'Heading 1',
	icon: 'header-one',
	command: heading1Toggle,
};

export const heading2: FormattingBarButtonData = {
	key: 'heading2',
	title: 'Heading 2',
	icon: 'header-two',
	command: heading2Toggle,
};

export const code: FormattingBarButtonData = {
	key: 'code',
	title: 'Code',
	icon: 'code',
	isToggle: true,
	command: codeToggle,
};

export const subscript: FormattingBarButtonData = {
	key: 'subscript',
	title: 'Subscript',
	icon: 'subscript',
	isToggle: true,
	command: subscriptToggle,
};

export const superscript: FormattingBarButtonData = {
	key: 'superscript',
	title: 'Superscript',
	icon: 'superscript',
	isToggle: true,
	command: superscriptToggle,
};

export const strikethrough: FormattingBarButtonData = {
	key: 'strikethrough',
	title: 'Strikethrough',
	ariaTitle: 'strike through',
	icon: 'strikethrough',
	isToggle: true,
	command: strikethroughToggle,
};

export const citation: FormattingBarButtonData = {
	key: 'citation',
	title: 'Citation',
	icon: 'bookmark',
	controls: nodeControls(ControlsFootnoteCitation, 'citation'),
	insertNodeType: 'citation',
};

export const reference: FormattingBarButtonData = {
	key: 'reference',
	title: 'Reference',
	icon: 'at',
	insertNodeType: 'reference',
	controls: nodeControls(ControlsReference, 'reference', {
		position: positionNearSelection,
		showCloseButton: false,
	}),
	isDisabled: (editorChangeObject: EditorChangeObject) => {
		if (editorChangeObject.view) {
			const { state } = editorChangeObject.view;
			const nodeLabels = getCurrentNodeLabels(state);
			return !Object.values(nodeLabels).some((nodeLabel) => nodeLabel.enabled);
		}
		return true;
	},
	popover: {
		condition: FormattingBarPopoverCondition.Disabled,
		component: ControlsReferencePopover,
	},
};

export const equation: FormattingBarButtonData = {
	key: 'equation',
	title: 'Equation',
	icon: 'function',
	insertNodeType: 'block_equation',
	controls: nodeControls(ControlsEquation, ['equation', 'block_equation']),
};

export const footnote: FormattingBarButtonData = {
	key: 'footnote',
	title: 'Footnote',
	icon: 'asterisk',
	insertNodeType: 'footnote',
	controls: nodeControls(ControlsFootnoteCitation, 'footnote'),
};

export const horizontalRule: FormattingBarButtonData = {
	key: 'horizontal_rule',
	title: 'Horizontal Line',
	insertNodeType: 'horizontal_rule',
	icon: 'minus',
};

export const table: FormattingBarButtonData = {
	key: 'table',
	title: 'Table',
	icon: 'th',
	insertNodeType: 'table',
	controls: {
		captureFocusOnMount: false,
		indicate: ({ selectionInTable }) => selectionInTable,
		show: showOrTriggerTable,
		trigger: showOrTriggerTable,
		position: positionNearSelection,
		component: ControlsTable,
	},
};

export const media: FormattingBarButtonData = {
	key: 'media',
	title: 'Media',
	icon: 'media',
	component: MediaButton,
	isMedia: true,
	controls: nodeControls(ControlsMedia, ['image', 'video', 'audio', 'iframe']),
};

export const minimalButtonSet = [[strong, em, link, equation]];
export const discussionButtonSet = [...minimalButtonSet, [media]];
export const inlineMenuButtonSet = [[heading1, heading2, strong, em, link]];

export const fullButtonSet = [
	[alignLeft, alignCenter, alignRight],
	[
		strong,
		em,
		link,
		bulletList,
		numberedList,
		blockquote,
		code,
		subscript,
		superscript,
		strikethrough,
		horizontalRule,
		equation,
		reference,
		citation,
		footnote,
		table,
	],
	[media],
];

export const layoutEditorButtonSet = [
	[alignLeft, alignCenter, alignRight],
	[
		strong,
		em,
		link,
		bulletList,
		numberedList,
		blockquote,
		code,
		subscript,
		superscript,
		strikethrough,
		horizontalRule,
		equation,
		citation,
		footnote,
		table,
	],
	[media],
];
