import React from 'react';
import { Spinner } from '@blueprintjs/core';

import { PubByline, PubTitle } from 'components';
import { Menu, MenuItem, MenuItemDivider } from 'components/Menu';
import { usePageContext } from 'utils/hooks';
import { createReadingParamUrl, useCollectionPubs } from 'client/utils/collections';
import { pubUrl, collectionUrl } from 'utils/canonicalUrls';
import { getSchemaForKind } from 'utils/collections/schemas';
import { Collection, Pub } from 'types';

import { usePubContext } from '../../pubHooks';
import CollectionsBarButton from './CollectionsBarButton';
import { useInfiniteScroll } from 'client/utils/useInfiniteScroll';

require('./collectionBrowser.scss');

type Props = {
	collection: Collection;
	currentPub: Pub;
};

const CollectionBrowser = (props: Props) => {
	const { collection, currentPub } = props;
	const { updateLocalData } = usePubContext();
	const { communityData } = usePageContext();
	const menuRef = React.useRef<HTMLUListElement | null>(null);
	const { pubs, error, isLoading, hasLoadedAllPubs, requestMorePubs } = useCollectionPubs(
		updateLocalData,
		collection,
	);
	const [visible, setVisible] = React.useState(false);

	useInfiniteScroll({
		enabled: !isLoading && !hasLoadedAllPubs && !error && visible,
		element: menuRef.current,
		onRequestMoreItems: requestMorePubs,
		scrollTolerance: 0,
	});
	const { bpDisplayIcon } = getSchemaForKind(collection.kind)!;
	const readingPubUrl = (pub) => createReadingParamUrl(pubUrl(communityData, pub), collection.id);

	// eslint-disable-next-line react/prop-types
	const renderDisclosure = ({ ref, ...disclosureProps }) => {
		return (
			<CollectionsBarButton
				icon={bpDisplayIcon}
				className="collection-browser-button"
				rightIcon="caret-down"
				ref={ref}
				{...disclosureProps}
			>
				{collection.title}
			</CollectionsBarButton>
		);
	};

	return (
		<Menu
			className="collection-browser-component_menu"
			disclosure={renderDisclosure}
			aria-label="Browse this collection"
			menuListRef={menuRef}
			onVisibleChange={setVisible}
		>
			<MenuItem
				icon="collection"
				text={collection.title}
				href={collectionUrl(communityData, collection)}
			/>
			<MenuItemDivider />
			{pubs &&
				pubs.length &&
				pubs.map((pub) => (
					<MenuItem
						active={currentPub.id === pub.id}
						href={readingPubUrl(pub)}
						textClassName="menu-item-text"
						icon="pubDoc"
						key={pub.id}
						text={
							<>
								<div className="title">
									<PubTitle pubData={pub} />
								</div>
								<PubByline pubData={pub} linkToUsers={false} />
							</>
						}
					/>
				))}
			{isLoading && (
				<MenuItem
					disabled
					className="loading-menu-item"
					textClassName="menu-item-text"
					icon={<Spinner size={30} />}
					text="Loading..."
				/>
			)}
			{error && (
				<MenuItem
					disabled
					className="loading-menu-item"
					textClassName="menu-item-text"
					text="Error loading Pubs"
				/>
			)}
		</Menu>
	);
};
export default CollectionBrowser;
