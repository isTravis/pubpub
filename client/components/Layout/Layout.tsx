import React from 'react';
import classNames from 'classnames';
import { useEffectOnce } from 'react-use';

import { Collection, Pub } from 'types';
import {
	LayoutBlock,
	LayoutOptions,
	LayoutPubsByBlock,
	resolveLayoutPubsByBlock,
} from 'utils/layout';
import { usePageContext } from 'utils/hooks';
import { useAnalytics } from 'utils/analytics/useAnalytics';
import { assert } from 'utils/assert';

import LayoutPubs from './LayoutPubs';
import LayoutHtml from './LayoutHtml';
import LayoutBanner from './LayoutBanner';
import LayoutText from './LayoutText';
import LayoutPagesCollections from './LayoutPagesCollections';
import LayoutCollectionHeader from './LayoutCollectionHeader';
import LayoutSubmissionBanner from './LayoutSubmissionBanner';

require('./layout.scss');

type Props = LayoutOptions & {
	blocks: LayoutBlock[];
	id?: string;
	layoutPubsByBlock: LayoutPubsByBlock<Pub>;
	collection?: Collection;
};

const Layout = (props: Props) => {
	const { locationData, loginData, communityData, pageData } = usePageContext();
	const { blocks, isNarrow, layoutPubsByBlock, id = '', collection } = props;
	const pubsByBlockId = resolveLayoutPubsByBlock(layoutPubsByBlock, blocks);

	const { page } = useAnalytics();

	/** Page track should only be done on mount & on client side */
	useEffectOnce(() => {
		/** Only track actual page visits, not dashboard visits e.g. when editing a page */
		if (locationData.isDashboard) {
			return;
		}

		if (collection) {
			page({
				type: 'collection' as const,
				communityId: collection.communityId,
				title: collection.title,
				collectionId: collection.id,
				collectionTitle: collection.title,
				collectionSlug: collection.slug,
			});
			return;
		}

		assert(!!pageData);

		page({
			type: 'page' as const,
			communityId: communityData.id,
			pageSlug: pageData.slug,
			title: pageData.title,
		});
	});

	const renderBlock = (block: LayoutBlock, index: number) => {
		if (block.type === 'pubs') {
			return (
				<div className="layout-pubs-block" key={index}>
					<LayoutPubs
						content={block.content}
						pubs={pubsByBlockId[block.id]}
						collectionId={collection && collection.id}
					/>
				</div>
			);
		}
		if (block.type === 'text') {
			return <LayoutText key={index} content={block.content} />;
		}
		if (block.type === 'html') {
			return <LayoutHtml key={index} content={block.content} />;
		}
		if (block.type === 'banner') {
			return (
				<LayoutBanner
					key={index}
					content={block.content}
					communityData={communityData}
					loginData={loginData}
					locationData={locationData}
				/>
			);
		}
		if (block.type === 'collections-pages') {
			return (
				<div className="layout-pages-block" key={index}>
					<LayoutPagesCollections
						content={block.content}
						pages={communityData.pages}
						collections={communityData.collections}
					/>
				</div>
			);
		}
		if (block.type === 'collection-header' && collection) {
			return (
				<LayoutCollectionHeader
					key={index}
					content={block.content}
					collection={collection}
				/>
			);
		}
		if (block.type === 'submission-banner') {
			return <LayoutSubmissionBanner key={index} content={block.content} />;
		}
		return null;
	};

	return (
		<div
			id={id}
			className={classNames(
				'layout-component',
				isNarrow && 'narrow',
				locationData.query.display === 'ultrawide' && 'ultrawide',
			)}
		>
			{blocks.map(renderBlock)}
		</div>
	);
};

export default Layout;
