import { PluginKey } from 'prosemirror-state';
import { collab } from 'prosemirror-collab';

import { generateHash } from 'utils/hashes';

import buildDocument from './document';
import buildCursors from './cursors';

export const collabDocPluginKey = new PluginKey('collaborative');

export default (schema, props) => {
	if (!props.collaborativeOptions?.firebaseRef) {
		return [];
	}

	const localClientId = `${props.collaborativeOptions.clientData.id}-${generateHash(6)}`;

	return [
		collab({ clientID: localClientId }),
		buildDocument(schema, props, collabDocPluginKey, localClientId),
		buildCursors(schema, props, collabDocPluginKey),
	];
};
