import { Button, Icon, Switch } from '@blueprintjs/core';
import classNames from 'classnames';
import { ConfirmDialog, DragDropListing, PubEdgeEditor, PubEdgeListingCard } from 'components';
import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { PubEdge } from 'types';

export type DashboardEdgesListingProps = {
	pubData: any;
	onUpdateEdge?: (pubEdge: PubEdge) => unknown;
	onRemoveEdge?: (...args: any[]) => any;
	onReorderEdges?: (...args: any[]) => any;
	onUpdateEdgeApproval?: (...args: any[]) => any;
	isInbound: boolean;
	pubEdges: any[];
	renderEmptyState: (...args: any[]) => any;
};

const renderRemoveEdgeButton = (callback) => {
	return (
		<ConfirmDialog
			onConfirm={callback}
			confirmLabel="Remove"
			text="Are you sure you want to remove this connection?"
		>
			{({ open }) => (
				<Button onClick={open} outlined minimal icon="small-cross">
					Remove
				</Button>
			)}
		</ConfirmDialog>
	);
};

const DashboardEdgesListing = (props: DashboardEdgesListingProps) => {
	const {
		isInbound,
		onUpdateEdge = null,
		onRemoveEdge = null,
		onReorderEdges = null,
		onUpdateEdgeApproval = null,
		pubData,
		pubEdges,
		renderEmptyState,
	} = props;
	const [editing, setEditing] = useState<string | null>(null);

	const handleDragEnd = (dragResult) => {
		const { source, destination } = dragResult;
		if (onReorderEdges) {
			onReorderEdges(source.index, destination.index);
		}
	};

	const renderEdgeListing = (pubEdge: PubEdge, dragHandleProps, isDragging) => {
		const { approvedByTarget } = pubEdge;
		const renderAsNotApproved = !!onUpdateEdgeApproval && !approvedByTarget;
		if (editing === pubEdge.id) {
			console.log(pubEdge);
		}
		return (
			<div
				className={classNames(
					'dashboard-edge-listing-item',
					isDragging && 'is-dragging',
					renderAsNotApproved && 'not-approved',
				)}
			>
				{onReorderEdges && (
					<div {...dragHandleProps} className="drag-handle">
						<Icon icon="drag-handle-vertical" />
					</div>
				)}
				<PubEdgeListingCard
					pubData={pubData}
					pubEdge={pubEdge}
					pubEdgeElement={
						editing === pubEdge.id ? (
							<PubEdgeEditor
								externalPublication={{} as any}
								onUpdateExternalPublication={(update) => {}}
								pubData={pubData}
							/>
						) : (
							undefined
						)
					}
					isInboundEdge={isInbound}
					accentColor="#ccc"
				>
					{onUpdateEdge && <button onClick={() => setEditing(pubEdge.id)}>Edit</button>}
					{onRemoveEdge && renderRemoveEdgeButton(() => onRemoveEdge(pubEdge))}
					{onUpdateEdgeApproval && (
						<Switch
							className="parent-approval-switch"
							onChange={() => onUpdateEdgeApproval(pubEdge, !approvedByTarget)}
							checked={approvedByTarget}
							label="Show on this Pub"
						/>
					)}
				</PubEdgeListingCard>
			</div>
		);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			{editing && 'EDITING!'}
			<DragDropListing
				className="dashboard-edges-listing-component"
				disabled={!onReorderEdges}
				itemId={(item) => item.id}
				items={pubEdges}
				renderItem={renderEdgeListing}
				renderEmptyState={renderEmptyState}
				droppableId="dashboardEdges"
				droppableType="DASHBOARD_EDGE"
				withDragHandles={!!onReorderEdges}
			/>
		</DragDropContext>
	);
};

export default DashboardEdgesListing;
