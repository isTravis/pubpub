import React from 'react';
import classNames from 'classnames';
import { AnchorButton } from '@blueprintjs/core';

import { PubByline, PubTitle } from 'components';
import { Collection, DefinitelyHas, Pub as BasePub } from 'types';
import { pubUrl } from 'utils/canonicalUrls';
import { getDashUrl } from 'utils/dashboard';
import { usePageContext } from 'utils/hooks';

import OverviewRowSkeleton from './OverviewRowSkeleton';
import { IconLabelPair, renderLabelPairs, getTypicalPubLabels } from './labels';

type PubWithAttributions = DefinitelyHas<BasePub, 'attributions'>;

type Props = {
	leftIconElement?: React.ReactNode;
	rightElement?: React.ReactNode;
	labels?: IconLabelPair[];
	className?: string;
	pub: PubWithAttributions;
	inCollection?: Collection;
};

const PubOverviewRow = (props: Props) => {
	const {
		pub,
		className,
		inCollection,
		leftIconElement = null,
		labels = null,
		rightElement: providedRightElement,
	} = props;
	const { communityData } = usePageContext();

	const rightElement = providedRightElement || (
		<AnchorButton
			minimal
			icon="circle-arrow-right"
			href={pubUrl(communityData, pub)}
			target="_blank"
		/>
	);

	const allLabels = [...(labels || []), ...getTypicalPubLabels(pub)];

	return (
		<OverviewRowSkeleton
			className={classNames('pub-overview-row-component', className)}
			title={<PubTitle pubData={pub} />}
			href={getDashUrl({ pubSlug: pub.slug, collectionSlug: inCollection?.slug })}
			byline={<PubByline pubData={pub} linkToUsers={false} truncateAt={8} />}
			details={renderLabelPairs(allLabels)}
			leftIcon={leftIconElement || 'pubDoc'}
			rightElement={rightElement}
			darkenRightIcons={!!inCollection}
		/>
	);
};

export default PubOverviewRow;
