import { useEffect, useLayoutEffect, useState } from 'react';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

import { updateNodeAttrsById } from 'components/Editor/utils/nodes';
import { EditorChangeObject } from 'components/Editor';

type Attrs = Node['attrs'];

const attrsHaveChanges = (
	oldAttrs: null | Attrs,
	newAttrs: null | Attrs,
	pendingKeys: string[],
) => {
	if (!oldAttrs || !newAttrs) {
		return false;
	}
	return pendingKeys.some((key) => newAttrs[key] !== oldAttrs[key]);
};

const getPendingAttrsObject = (attrs: null | Attrs, pendingKeys: string[]) => {
	const nextAttrs = {};
	if (attrs) {
		pendingKeys.forEach((key) => {
			nextAttrs[key] = attrs[key];
		});
	}
	return nextAttrs;
};

export const usePendingAttrs = ({
	selectedNode,
	updateNode,
	editorView,
}: {
	selectedNode?: Node;
	updateNode: EditorChangeObject['updateNode'];
	editorView?: EditorView;
}) => {
	const [attrs, setAttrs] = useState(selectedNode?.attrs ?? null);
	const [targetedNodeId, setTargetedNodeId] = useState(selectedNode?.attrs.id);
	const [pendingKeys, setPendingKeys] = useState<string[]>([]);
	const selectedNodeId = selectedNode?.attrs.id;

	useLayoutEffect(() => {
		if (targetedNodeId) {
			const pendingAttrs = getPendingAttrsObject(attrs, pendingKeys);
			if (editorView) {
				updateNodeAttrsById(editorView, targetedNodeId, pendingAttrs);
			}
		}
		if (selectedNode) {
			setPendingKeys([]);
			setAttrs(selectedNode.attrs);
		}
		setTargetedNodeId(selectedNodeId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedNodeId]);

	if (!selectedNode) {
		return null;
	}

	const hasPendingChanges = attrsHaveChanges(selectedNode.attrs, attrs, pendingKeys);

	const commitChanges = () => {
		const nextAttrs = getPendingAttrsObject(attrs, pendingKeys);
		updateNode!(nextAttrs);
		setPendingKeys([]);
	};

	const updateAttrs = (nextAttrs: Attrs) => {
		setPendingKeys((prevPendingKeys) => [
			...new Set([...prevPendingKeys, ...Object.keys(nextAttrs)]),
		]);
		setAttrs((prevAttrs: Attrs) => ({ ...prevAttrs, ...nextAttrs }));
	};

	return {
		commitChanges,
		hasPendingChanges,
		attrs,
		updateAttrs,
	};
};
