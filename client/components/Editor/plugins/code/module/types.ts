import { EditorState, Transaction } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { LanguageSupport } from '@codemirror/language';

export type LanguageLoaders = Record<string, () => Promise<LanguageSupport>>;
import { Extension } from '@codemirror/state';

export type CodeBlockSettings = {
	createSelect: (
		settings: CodeBlockSettings,
		dom: HTMLElement,
		node: Node,
		view: EditorView,
		getPos: (() => number) | boolean,
	) => () => void;
	updateSelect: (
		settings: CodeBlockSettings,
		dom: HTMLElement,
		node: Node,
		view: EditorView,
		getPos: (() => number) | boolean,
		oldNode: Node,
	) => void;
	stopEvent: (
		e: Event,
		node: Node,
		getPos: (() => number) | boolean,
		view: EditorView,
		dom: HTMLElement,
	) => boolean;
	languageLoaders?: LanguageLoaders;
	languageNameMap?: Record<string, string>;
	languageWhitelist?: string[];
	undo?: (state: EditorState, dispatch: (tr: Transaction) => void) => void;
	redo?: (state: EditorState, dispatch: (tr: Transaction) => void) => void;
	theme?: Extension[];
	readOnly: boolean;
};
