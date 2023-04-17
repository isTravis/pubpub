import { Schema } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';

import { PluginsOptions } from '../..';

import { SuggestedEditsPluginState } from './types';
import { getInitialPluginState } from './state';
import { appendTransaction } from './appendTransaction';
import { suggestedEditsPluginKey } from './key';
import { getSuggestionRanges } from './ranges';

export default (schema: Schema, options: PluginsOptions) => {
	const { collaborativeOptions } = options;
	return new Plugin<SuggestedEditsPluginState>({
		key: suggestedEditsPluginKey,
		appendTransaction,
		state: {
			init: () => getInitialPluginState(schema, collaborativeOptions?.clientData?.id!),
			apply: (
				tr: Transaction,
				pluginState: SuggestedEditsPluginState,
				_,
				newState: EditorState,
			) => {
				const meta = tr.getMeta(suggestedEditsPluginKey);
				const suggestionRanges =
					pluginState.isEnabled && tr.docChanged
						? getSuggestionRanges(newState.doc)
						: pluginState.suggestionRanges;
				return {
					...pluginState,
					...meta?.updatedState,
					suggestionRanges,
				};
			},
		},
	});
};
