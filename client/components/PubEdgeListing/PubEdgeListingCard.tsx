import { Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useState, useCallback } from 'react';

import { PubEdge } from 'components';
import { toTitleCase } from 'utils/strings';
import { usePageContext } from 'utils/hooks';
import { relationTypeDefinitions } from 'utils/pubEdge';
import { pubShortUrl } from 'utils/canonicalUrls';

import { pubEdgeType } from '../PubEdge/constants';

require('./pubEdgeListingCard.scss');

export type PubEdgeListingCardProps = {
	accentColor?: string;
	children?: React.ReactNode;
	inPubBody?: boolean;
	isInboundEdge: boolean;
	parentPub?: {
		title?: string;
	};
	pubData: any;
	pubEdge: pubEdgeType;
	pubEdgeElement?: React.ReactNode;
	showIcon?: boolean;
	viewingFromSibling?: boolean;
};

const getIsViewingFromTarget = (pubEdge, viewingFromSibling, isInboundEdge) => {
	const { pubIsParent } = pubEdge;
	if (viewingFromSibling) {
		// If the `pub` in the edge relationship is the parent, then the `targetPub` is the child.
		// We want this edge to display the child -- in other words, we want to view from the
		// `targetPub` towards the `pub` only if the `pub` is the child.
		return !pubIsParent;
	}
	// If this edge is inbound, that means another Pub (relative to our vantage point) created it,
	// which is to say that we're viewing it from the target.
	return isInboundEdge;
};

type Props = PubEdgeListingCardProps;

const PubEdgeListingCard = (props: Props) => {
	const { communityData } = usePageContext();
	const {
		accentColor,
		children = [],
		inPubBody = false,
		isInboundEdge,
		pubEdge,
		pubEdgeElement = null,
		parentPub = null,
		showIcon,
		viewingFromSibling = false,
		pubData,
	} = props;
	const viewingFromTarget = getIsViewingFromTarget(pubEdge, viewingFromSibling, isInboundEdge);
	const [hover, setHover] = useState(false);
	const handleMouseEnter = useCallback(() => setHover(true), []);
	const handleMouseLeave = useCallback(() => setHover(false), []);
	const hoverAccentColor = hover ? accentColor || communityData.accentColorDark : '#ddd';
	const style = { borderColor: hoverAccentColor };

	const renderRelation = () => {
		const { relationType, pubIsParent } = pubEdge;
		const viewingFromParent =
			!viewingFromSibling && viewingFromTarget ? !pubIsParent : pubIsParent;
		const relationDefinition = relationTypeDefinitions[relationType];

		if (relationDefinition) {
			const { article, preposition, name } = relationDefinition;
			const relationName = <span className="relation-name">{name}</span>;

			if (viewingFromSibling) {
				const titlePart = parentPub && (
					<>
						{preposition}{' '}
						<a className="pub-title" href={pubShortUrl(parentPub)}>
							{parentPub.title}
						</a>
					</>
				);
				return (
					<>
						Another {relationName} {titlePart}
					</>
				);
			}

			const pubTitleNode = parentPub && <span className="pub-title">{parentPub.title}</span>;

			if (viewingFromParent) {
				return (
					<>
						{toTitleCase(article)} {relationName} {preposition}{' '}
						{pubTitleNode || 'this Pub'}
					</>
				);
			}

			return (
				<>
					{pubTitleNode || 'This Pub'} is {article} {relationName} {preposition}
				</>
			);
		}

		return null;
	};

	return (
		<div
			className={classNames('pub-edge-listing-card-component', inPubBody && 'in-pub-body')}
			style={style}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleMouseEnter}
			onBlur={handleMouseLeave}
		>
			{children && <div className="controls">{children}</div>}
			<div className={classNames('relation', showIcon && 'show-icon')}>
				{showIcon && (
					<Icon
						icon="key-enter"
						color={accentColor}
						iconSize={14}
						className="drop-return"
					/>
				)}
				{renderRelation()}
			</div>
			{pubEdgeElement || (
				<PubEdge
					accentColor={hoverAccentColor}
					actsLikeLink={inPubBody}
					pubEdge={pubEdge}
					viewingFromTarget={viewingFromTarget}
					showDescriptionByDefault={pubData.pubEdgeDescriptionVisible}
				/>
			)}
		</div>
	);
};

export default PubEdgeListingCard;
