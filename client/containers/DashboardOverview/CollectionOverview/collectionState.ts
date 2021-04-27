import { useMemo, useState } from 'react';

import { CollectionPub, Pub, Collection, Community } from 'utils/types';
import { findRankInRankedList, sortByRank } from 'utils/rank';
import { usePendingChanges, usePageContext } from 'utils/hooks';
import ensureUserForAttribution from 'utils/ensureUserForAttribution';
import { usePersistableState } from 'client/utils/usePersistableState';
import * as api from 'client/utils/collections/api';

const linkCollection = (collection: Collection, community: Community) => {
	const page = community.pages?.find((pg) => pg.id === collection.pageId);
	const attributions = collection.attributions?.map(ensureUserForAttribution);
	return { ...collection, page, attributions };
};

type UseCollectionPubsOptions = {
	collection: Collection;
	initialCollectionPubs: CollectionPub[];
	pubs: Pub[];
};

export const useCollectionPubs = (options: UseCollectionPubsOptions) => {
	const { collection, pubs, initialCollectionPubs } = options;
	const { id: collectionId } = collection;
	const {
		communityData: { id: communityId },
	} = usePageContext();
	const { pendingPromise } = usePendingChanges();
	const [collectionPubs, setCollectionPubs] = useState(() => sortByRank(initialCollectionPubs));
	const [pubsCount, setPubsCount] = useState(collection.scopeSummary?.pubs || 0);

	const reorderCollectionPubs = (sourceIndex: number, destinationIndex: number) => {
		const nextCollectionPubs = [...collectionPubs];
		const [removed] = nextCollectionPubs.splice(sourceIndex, 1);
		const newRank = findRankInRankedList(nextCollectionPubs, destinationIndex);
		const updatedValue = {
			...removed,
			rank: newRank,
		};
		nextCollectionPubs.splice(destinationIndex, 0, updatedValue);
		pendingPromise(
			api.updateCollectionPub({
				communityId,
				id: updatedValue.id,
				update: { rank: newRank },
			}),
		);
		setCollectionPubs(nextCollectionPubs);
	};

	const updateCollectionPub = (collectionPub: CollectionPub) => {
		setCollectionPubs(
			collectionPubs.map((cp) => {
				if (cp.id === collectionPub.id) {
					return collectionPub;
				}
				return cp;
			}),
		);
	};

	const removeCollectionPub = (collectionPub: CollectionPub) => {
		pendingPromise(
			api.removeCollectionPub({
				communityId,
				id: collectionPub.id,
			}),
		);
		setPubsCount((c) => c - 1);
		setCollectionPubs(collectionPubs.filter((cp) => cp.id !== collectionPub.id));
	};

	const setCollectionPubContextHint = (
		collectionPub: CollectionPub,
		contextHint: null | string,
	) => {
		pendingPromise(
			api.updateCollectionPub({
				communityId,
				id: collectionPub.id,
				update: { contextHint },
			}),
		);
		updateCollectionPub({ ...collectionPub, contextHint });
	};

	const setCollectionPubIsPrimary = (collectionPub: CollectionPub) => {
		const { pubId } = collectionPub;
		const pub = pubs.find((p) => p.id === pubId);
		if (pub && pub.collectionPubs) {
			const newPubRank = findRankInRankedList(pub.collectionPubs, 0, 'pubRank');
			pendingPromise(
				api.updateCollectionPub({
					communityId,
					id: collectionPub.id,
					update: { pubRank: newPubRank },
				}),
			);
			updateCollectionPub({ ...collectionPub, pubRank: newPubRank });
		}
	};

	const addCollectionPub = (pub: Pub) => {
		pendingPromise(
			api
				.addCollectionPub({
					collectionId,
					communityId,
					pubId: pub.id,
				})
				.then((collectionPub) => {
					setPubsCount((c) => c + 1);
					setCollectionPubs((newestCollectionPubs) =>
						sortByRank([...newestCollectionPubs, collectionPub]),
					);
				}),
		);
	};

	return {
		addCollectionPub,
		collectionPubs,
		removeCollectionPub,
		reorderCollectionPubs,
		setCollectionPubContextHint,
		setCollectionPubIsPrimary,
		pubsCount,
	};
};

export const useCollectionState = (initialCollection: Collection) => {
	const { updateCollection: updateCollectionGlobally, communityData } = usePageContext();
	const { pendingPromise } = usePendingChanges();

	const { state, error, update, hasChanges, persist } = usePersistableState(
		initialCollection,
		(partialCollection) =>
			pendingPromise(
				api.updateCollection({
					communityId: communityData.id,
					collectionId: initialCollection.id,
					updatedCollection: partialCollection,
				}),
			).then(() => updateCollectionGlobally(partialCollection)),
	);

	const collection = useMemo(() => linkCollection(state, communityData), [state, communityData]);
	const fieldErrors = error?.type === 'InvalidFields' ? error.fields : null;

	const updateCollection = (next) => update(next, true);

	const deleteCollection = () =>
		pendingPromise(
			api.deleteCollection({
				communityId: communityData.id,
				collectionId: collection.id,
			}),
		);

	return {
		fieldErrors,
		collection,
		hasChanges,
		persistCollection: persist,
		updateCollection,
		deleteCollection,
	};
};
