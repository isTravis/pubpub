import React, { useMemo, useState } from 'react';
import { NonIdealState } from '@blueprintjs/core';

import { Collection, Pub, PubsQuery } from 'types';
import { fuzzyMatchCollection } from 'utils/fuzzyMatch';
import { useManyPubs } from 'client/utils/useManyPubs';
import { useInfiniteScroll } from 'client/utils/useInfiniteScroll';

import {
	PubOverviewRow,
	ExpandableCollectionOverviewRow,
	OverviewRows,
	LoadMorePubsRow,
	SpecialRow,
} from '../overviewRows';
import { KindToggle, OverviewSearchGroup } from '../helpers';

require('./communityItems.scss');

type Props = {
	collections: Collection[];
	initialPubs: Pub[];
	initiallyLoadedAllPubs: boolean;
};

const getSearchPlaceholderText = (
	showCollections: boolean,
	showPubs: boolean,
	showSubmissions: boolean,
) => {
	if (showCollections && showPubs) {
		return 'Search Collections and Pubs';
	}
	if (showCollections) {
		return 'Search Collections';
	}
	if (showSubmissions) {
		return 'Search Submitted Pubs';
	}
	return 'Search Pubs';
};

const CommunityItems = (props: Props) => {
	const { collections: allCollections, initialPubs, initiallyLoadedAllPubs } = props;
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState<null | Partial<PubsQuery>>(null);
	const [showPubs, setShowPubs] = useState(true);
	const [showCollections, setShowCollections] = useState(true);
	const [showSubmissions, setShowSubmissions] = useState(false);
	const isSearchingOrFiltering = !!filter || !!searchTerm;
	console.log('check if any community has submission status for pubs');
	const collections = useMemo(
		() => allCollections.filter((collection) => fuzzyMatchCollection(collection, searchTerm)),
		[allCollections, searchTerm],
	);

	const {
		currentQuery: { pubs, isLoading, hasLoadedAllPubs, loadMorePubs },
	} = useManyPubs({
		isEager: isSearchingOrFiltering,
		initialPubs,
		initiallyLoadedAllPubs,
		batchSize: 200,
		query: {
			term: searchTerm,
			ordering: { field: 'title', direction: 'ASC' },
			...filter,
		},
	});

	const canShowCollections = !filter;
	const canLoadMorePubs = !hasLoadedAllPubs && showPubs;

	useInfiniteScroll({
		enabled: !isLoading && canLoadMorePubs,
		useDocumentElement: true,
		onRequestMoreItems: loadMorePubs,
	});

	const renderCollections = () => {
		return collections.map((collection) => (
			<ExpandableCollectionOverviewRow collection={collection} key={collection.id} />
		));
	};

	const renderPubs = () => {
		return pubs.map((pub) => <PubOverviewRow pub={pub} key={pub.id} />);
	};

	const renderEmptyState = () => {
		if (collections.length === 0) {
			if (initialPubs.length === 0) {
				return (
					<NonIdealState
						icon="clean"
						title="This Community looks brand new!"
						description="Try creating a Pub or Collection from above."
					/>
				);
			}
			if (pubs.length === 0 && hasLoadedAllPubs && isSearchingOrFiltering) {
				return <SpecialRow>No matching Pubs or Collections.</SpecialRow>;
			}
		}
		return null;
	};

	return (
		<div className="community-items-component">
			<OverviewSearchGroup
				placeholder={getSearchPlaceholderText(showCollections, showPubs, showSubmissions)}
				onUpdateSearchTerm={(t) => t === '' && setSearchTerm(t)}
				onCommitSearchTerm={setSearchTerm}
				onChooseFilter={setFilter}
				rightControls={
					<>
						{canShowCollections && (
							<KindToggle
								selected={showCollections}
								onSelect={() => {
									setShowCollections(!showCollections);
									if (showCollections && !showPubs) {
										setShowPubs(true);
									}
								}}
								icon="collection"
								label="Collections"
								count={collections.length}
							/>
						)}
						<KindToggle
							selected={showPubs || !canShowCollections}
							onSelect={() => {
								setShowPubs(!showPubs);
								if (showPubs && !showCollections) {
									setShowCollections(true);
								}
							}}
							icon="pubDoc"
							label="Pubs"
							count={hasLoadedAllPubs ? pubs.length : `${pubs.length}+`}
							disabled={!canShowCollections}
						/>
						<KindToggle
							selected={showSubmissions}
							onSelect={() => {
								setShowSubmissions(!showSubmissions);
							}}
							icon="pubDoc"
							label="Pubs"
							count={hasLoadedAllPubs ? pubs.length : `${pubs.length}+`}
							disabled={!canShowCollections}
						/>
					</>
				}
			/>
			<OverviewRows>
				{showCollections && canShowCollections && renderCollections()}
				{showPubs && renderPubs()}
				{canLoadMorePubs && <LoadMorePubsRow isLoading />}
				{renderEmptyState()}
			</OverviewRows>
		</div>
	);
};

export default CommunityItems;
