import { useState } from 'react';

import { usePendingChanges } from 'utils/hooks';
import { findRankInRankedList, sortByRank } from 'utils/rank';
import { apiFetch } from 'client/utils/apiFetch';
import { Pub as BarePub, InboundEdge, OutboundEdge, PubEdge } from 'types';

type Pub = BarePub & {
	outboundEdges: OutboundEdge[];
	inboundEdges: InboundEdge[];
};

export const useDashboardEdges = (pubData: Pub) => {
	const [outboundEdges, setOutboundEdges] = useState(sortByRank(pubData.outboundEdges));
	const [inboundEdges, setInboundEdges] = useState(sortByRank(pubData.inboundEdges));
	const { pendingPromise } = usePendingChanges();

	const addCreatedOutboundEdge = (createdOutboundEdge) => {
		setOutboundEdges(sortByRank([...outboundEdges, createdOutboundEdge]));
	};

	const reorderOutboundEdges = (sourceIndex, destinationIndex) => {
		const nextOutboundEdges = [...outboundEdges];
		const [removed] = nextOutboundEdges.splice(sourceIndex, 1);
		const newRank = findRankInRankedList(nextOutboundEdges, destinationIndex);
		const updatedValue = {
			...removed,
			rank: newRank,
		};
		nextOutboundEdges.splice(destinationIndex, 0, updatedValue);
		pendingPromise(
			apiFetch.put('/api/pubEdges', {
				pubEdgeId: updatedValue.id,
				rank: newRank,
			}),
		);
		setOutboundEdges(nextOutboundEdges);
	};

	const updateOutboundEdge = (outboundEdge: PubEdge) => {
		const index = outboundEdges.findIndex((edge) => edge.id === outboundEdge.id);
		const nextOutboundEdges = [...outboundEdges];
		nextOutboundEdges[index] = outboundEdge;
		setOutboundEdges(nextOutboundEdges);
	};

	const removeOutboundEdge = (outboundEdge) => {
		console.log(outboundEdge);
		pendingPromise(apiFetch.delete('/api/pubEdges', { pubEdgeId: outboundEdge.id }));
		setOutboundEdges(outboundEdges.filter((edge) => edge.id !== outboundEdge.id));
	};

	const updateInboundEdgeApproval = (inboundEdge, approvedByTarget) => {
		setInboundEdges(
			inboundEdges.map((edge) => {
				if (edge.id === inboundEdge.id) {
					return {
						...edge,
						approvedByTarget,
					};
				}
				return edge;
			}),
		);
		pendingPromise(
			apiFetch.put('/api/pubEdges/approvedByTarget', {
				pubEdgeId: inboundEdge.id,
				approvedByTarget,
			}),
		);
	};

	return {
		outboundEdges,
		inboundEdges,
		addCreatedOutboundEdge,
		reorderOutboundEdges,
		updateOutboundEdge,
		removeOutboundEdge,
		updateInboundEdgeApproval,
	};
};
