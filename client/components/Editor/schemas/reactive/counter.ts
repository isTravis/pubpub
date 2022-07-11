import { Node } from 'prosemirror-model';
import { useDocumentState, useTransactionState } from '@pubpub/prosemirror-reactive';

import { NodeLabelMap, ReferenceableNodeType } from '../../types';

import { isNodeLabelEnabled } from '../../utils';

type CounterOptions = {
	counterType?: string;
	useNodeLabels?: boolean;
	nodeFingerprintFn?: (node: Node) => any;
};

export const counter = (options: CounterOptions = {}) => {
	return (node: Node) => {
		const { counterType = node.type.name, useNodeLabels = false, nodeFingerprintFn } = options;
		const { nodeLabels } = useDocumentState();

		let resolvedCounterType = counterType;

		if (useNodeLabels) {
			const nodeLabel = (nodeLabels as NodeLabelMap)[counterType as ReferenceableNodeType];
			if (!(nodeLabel && isNodeLabelEnabled(node, nodeLabels))) {
				console.log({ nodeLabel, inle: isNodeLabelEnabled(node, nodeLabels) });
				return null;
			}
			const maybeEnabledNode = isNodeLabelEnabled(node, nodeLabels);
			if (maybeEnabledNode) {
				resolvedCounterType = maybeEnabledNode;
			} else {
				return null;
			}
		}

		const counterState = useTransactionState(['counter', resolvedCounterType], {
			countsMap: {},
			maxCount: 0,
		});

		if (nodeFingerprintFn) {
			const fingerprint = JSON.stringify(nodeFingerprintFn(node));
			if (!counterState.countsMap[fingerprint]) {
				counterState.maxCount++;
				counterState.countsMap[fingerprint] = counterState.maxCount;
			}
			return counterState.countsMap[fingerprint];
		}

		counterState.maxCount++;

		return counterState.maxCount;
	};
};
