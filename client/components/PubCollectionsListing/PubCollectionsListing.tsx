import React, { useMemo } from 'react';
import classNames from 'classnames';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Divider, Button, Tooltip } from '@blueprintjs/core';
import { Button as RKButton } from 'reakit/Button';

import { Collection, CollectionPub as BareCollectionPub, Pub } from 'utils/types';
import { DragDropListing, Icon, QueryListDropdown } from 'components';
import { findRankInRankedList, sortByRank } from 'utils/rank';
import { getIconForCollectionKind } from 'utils/collections/schemas';
import { getUserManagedCollections } from 'utils/collections/permissions';
import { getPrimaryCollection } from 'utils/collections/primary';
import { usePageContext, usePendingChanges } from 'utils/hooks';
import { fuzzyMatchCollection } from 'utils/fuzzyMatch';
import * as api from 'client/utils/collections/api';

require('./pubCollectionsListing.scss');

type CollectionPub = BareCollectionPub & { collection: Collection };

type Props = {
	canManage: boolean;
	allCollections: Collection[];
	pub: Pub;
	collectionPubs: CollectionPub[];
	updateCollectionPubs: (collectionPubs: CollectionPub[]) => unknown;
};

const PubCollectionsListing = (props: Props) => {
	const { collectionPubs, canManage, updateCollectionPubs, allCollections, pub } = props;
	const { communityData, scopeData } = usePageContext();
	const { pendingPromise } = usePendingChanges();

	const { canAddCollections, canRemoveCollectionIds } = useMemo(() => {
		const addedCollectionIds = new Set(collectionPubs.map((cp) => cp.collectionId));
		const userManagedCollections = getUserManagedCollections(allCollections, scopeData);
		return {
			canAddCollections: userManagedCollections.filter(
				(collection) => !addedCollectionIds.has(collection.id),
			),
			canRemoveCollectionIds: new Set(
				userManagedCollections.map((c) => c.id).filter((id) => addedCollectionIds.has(id)),
			),
		};
	}, [allCollections, scopeData, collectionPubs]);

	const primaryCollection = getPrimaryCollection(collectionPubs);

	const handleAddCollectionPub = async (collection: Collection) => {
		const newCollectionPub = await pendingPromise(
			api.addCollectionPub({
				communityId: communityData.id,
				pubId: pub.id,
				collectionId: collection.id,
			}),
		);
		updateCollectionPubs([...collectionPubs, { ...newCollectionPub, collection: collection }]);
	};

	const handleRemoveCollectionPub = (id: string) => {
		pendingPromise(api.removeCollectionPub({ communityId: communityData.id, id: id }));
		updateCollectionPubs(collectionPubs.filter((cp) => cp.id !== id));
	};

	const handleDragEnd = (result: DropResult) => {
		const {
			source: { index: sourceIndex },
			destination: { index: destinationIndex },
		} = result;
		const nextCollectionPubs = [...collectionPubs];
		const [removed] = nextCollectionPubs.splice(sourceIndex, 1);
		const newPubRank = findRankInRankedList(nextCollectionPubs, destinationIndex, 'pubRank');
		const updatedValue = {
			...removed,
			pubRank: newPubRank,
		};
		nextCollectionPubs.splice(destinationIndex, 0, updatedValue);
		pendingPromise(
			api.updateCollectionPub({
				communityId: communityData.id,
				id: updatedValue.id,
				update: { pubRank: newPubRank },
			}),
		);
		updateCollectionPubs(nextCollectionPubs);
	};

	const renderCollectionTitle = (
		collection: Collection,
		onClick?: () => unknown,
		otherClassName?: string,
	) => {
		const inner = (
			<>
				<Icon
					icon={getIconForCollectionKind(collection.kind) as string}
					className="collection-kind-icon"
				/>
				{collection.title}
				{!collection.isPublic && <Icon icon="lock2" className="title-icon" />}
				{primaryCollection?.id === collection.id && (
					<Tooltip content="Primary Collection">
						<Icon icon="star" className="title-icon" />
					</Tooltip>
				)}
			</>
		);

		const className = classNames(
			'pub-collections-listing_collection-title',
			!!onClick && 'interactive',
			otherClassName,
		);

		if (onClick) {
			return (
				<RKButton as="div" onClick={onClick} className={className}>
					{inner}
				</RKButton>
			);
		}

		return <div className={className}>{inner}</div>;
	};

	const renderAvailableCollection = (
		collection: Collection,
		{ handleClick, modifiers: { active } },
	) => {
		return renderCollectionTitle(collection, handleClick, active && 'active');
	};

	const renderCollectionPub = (
		collectionPub: CollectionPub,
		dragHandleProps: any,
		isDragging: boolean,
	) => {
		const { collection } = collectionPub;
		const canRemove = canRemoveCollectionIds.has(collection.id);
		return (
			<div key={collectionPub.id}>
				<div className={classNames('collection-row', isDragging && 'is-dragging')}>
					{dragHandleProps && (
						<span {...dragHandleProps}>
							<Icon icon="drag-handle-vertical" />
						</span>
					)}
					{renderCollectionTitle(collection)}
					{canRemove && (
						<Button
							small
							minimal
							icon="small-cross"
							onClick={() => handleRemoveCollectionPub(collectionPub.id)}
						/>
					)}
				</div>
				<Divider />
			</div>
		);
	};

	if (collectionPubs.length === 0 && canAddCollections.length === 0) {
		return <>You don't have permission to add this Pub to any Collections.</>;
	}

	return (
		<div className="pub-collections-listing">
			{canAddCollections.length > 0 && (
				<QueryListDropdown
					itemPredicate={(query, collection) => fuzzyMatchCollection(collection, query)}
					items={canAddCollections}
					itemRenderer={renderAvailableCollection}
					emptyListPlaceholder="No Collections match this search."
					searchPlaceholder="Search for Collections"
					onItemSelect={handleAddCollectionPub}
					position="bottom-left"
				>
					<Button icon="plus" className="add-button">
						Add to Collections
					</Button>
				</QueryListDropdown>
			)}
			<DragDropContext onDragEnd={handleDragEnd}>
				<DragDropListing
					items={sortByRank(collectionPubs, 'pubRank')}
					renderItem={renderCollectionPub}
					renderEmptyState={() => null}
					droppableId="dashboardEdges"
					droppableType="DASHBOARD_EDGE"
					withDragHandles={canManage}
				/>
			</DragDropContext>
		</div>
	);
};

export default PubCollectionsListing;
