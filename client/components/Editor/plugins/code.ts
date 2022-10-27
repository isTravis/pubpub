import { undo, redo } from 'prosemirror-history';
import {
	CodeBlockSettings,
	codeMirrorBlockPlugin,
	defaultSettings,
	languageLoaders,
	legacyLanguageLoaders,
} from 'prosemirror-codemirror-block';

import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

export const myCreateSelect = (
	settings: CodeBlockSettings,
	dom: HTMLElement,
	node: Node,
	view: EditorView,
	getPos: (() => number) | boolean,
) => {
	if (!settings.languageLoaders) return () => {};
	const wrapper = document.createElement('div');
	wrapper.className = 'bp3-html-select codeblock-select-wrapper';
	const select = document.createElement('select');
	const carets = document.createElement('span');
	carets.className = 'bp3-icon bp3-icon-double-caret-vertical';
	wrapper.append(select);
	wrapper.append(carets);
	select.className = 'codeblock-select';
	const noneOption = document.createElement('option');
	noneOption.value = 'none';
	noneOption.textContent = settings.languageNameMap?.none || 'none';
	select.append(noneOption);
	Object.keys(languageLoaders)
		.sort()
		.forEach((lang) => {
			if (settings.languageWhitelist && !settings.languageWhitelist.includes(lang)) return;
			const option = document.createElement('option');
			option.value = lang;
			option.textContent = settings.languageNameMap?.[lang] || lang;
			select.append(option);
		});
	select.value = node.attrs.lang || 'none';
	dom.prepend(wrapper);
	select.onchange = async (e) => {
		if (!(e.target instanceof HTMLSelectElement)) return;
		const lang = e.target.value;
		if (typeof getPos === 'function') {
			view.dispatch(
				view.state.tr.setNodeMarkup(getPos(), undefined, {
					...node.attrs,
					lang,
				}),
			);
		}
	};
	// Delete code.
	return () => {};
};

export default (schema) => {
	if (schema.nodes.code_block) {
		return [
			codeMirrorBlockPlugin({
				...defaultSettings,
				createSelect: myCreateSelect,
				languageLoaders: { ...languageLoaders, ...legacyLanguageLoaders },
				undo,
				redo,
			}),
		];
	}
	return [];
};
