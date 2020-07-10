import { NonIdealState } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';

import { Filter, Mode, allFilters } from './constants';
import { pubEdgeType } from '../PubEdge/constants';
import PubEdgeListingCard from './PubEdgeListingCard';
import PubEdgeListingCounter from './PubEdgeListingCounter';
import PubEdgeListingControls from './PubEdgeListingControls';

require('./pubEdgeListing.scss');

const propTypes = {
	accentColor: PropTypes.string.isRequired,
	className: PropTypes.string,
	hideIfNoInitialMatches: PropTypes.bool,
	isolated: PropTypes.bool,
	pubData: PropTypes.shape({
		inboundEdges: PropTypes.shape(pubEdgeType).isRequired,
		outboundEdges: PropTypes.shape(pubEdgeType).isRequired,
		siblingEdges: PropTypes.shape(pubEdgeType).isRequired,
		title: PropTypes.string,
	}).isRequired,
	initialMode: PropTypes.string,
	initialFilters: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
	className: '',
	hideIfNoInitialMatches: true,
	isolated: false,
	initialMode: Mode.Carousel,
	initialFilters: [Filter.Child],
};

const collateAndFilterPubEdges = (filters, pubData) => {
	const { inboundEdges, outboundEdges, siblingEdges } = pubData;
	const includeParents = filters.includes(Filter.Parent);
	const includeChildren = filters.includes(Filter.Child);
	const includeSiblings = filters.includes(Filter.Sibling);
	const filteredPubEdges = [];
	const parentEdgeValues = [];
	const childEdgeValues = [];
	const siblingEdgeValues = [];

	outboundEdges.forEach((edge) => {
		const { pubIsParent } = edge;
		const included = pubIsParent ? includeChildren : includeParents;
		const edgeValue = { isSibling: false, edge: edge, pubTitle: null };
		if (included) {
			filteredPubEdges.push(edgeValue);
		}
		if (pubIsParent) {
			childEdgeValues.push(edgeValue);
		} else {
			parentEdgeValues.push(edgeValue);
		}
	});

	inboundEdges.forEach((edge) => {
		const { pubIsParent } = edge;
		const included = pubIsParent ? includeParents : includeChildren;
		const edgeValue = { isSibling: false, edge: edge, pubTitle: null };
		if (included) {
			filteredPubEdges.push(edgeValue);
		}
		if (pubIsParent) {
			parentEdgeValues.push(edgeValue);
		} else {
			childEdgeValues.push(edgeValue);
		}
	});

	siblingEdges.forEach((edge) => {
		const { pubIsParent, pub, targetPub } = edge;
		const edgeValue = {
			isSibling: true,
			edge: edge,
			pubTitle: pubIsParent ? pub.title : targetPub.title,
		};
		siblingEdgeValues.push(edgeValue);
		if (includeSiblings) {
			filteredPubEdges.push(edgeValue);
		}
	});

	return {
		filteredPubEdgeValues: filteredPubEdges,
		collatedPubEdgeValues: [...parentEdgeValues, ...childEdgeValues, ...siblingEdgeValues],
	};
};

const PubEdgeListing = (props) => {
	const {
		accentColor,
		className,
		hideIfNoInitialMatches,
		initialMode,
		initialFilters,
		isolated,
		pubData,
	} = props;
	const [index, setIndex] = useState(0);
	const [mode, setMode] = useState(initialMode);
	const [filters, setFilters] = useState(initialFilters);

	const { filteredPubEdgeValues, collatedPubEdgeValues } = collateAndFilterPubEdges(
		filters,
		pubData,
	);

	const [initiallyRenderEmpty] = useState(
		hideIfNoInitialMatches && filteredPubEdgeValues.length === 0,
	);
	const { [index]: activeEdgeValue, length } = filteredPubEdgeValues;

	const next = useCallback(() => setIndex((i) => (i + 1) % length), [length]);
	const back = useCallback(() => setIndex((i) => (i - 1 + length) % length), [length]);

	const onFilterToggle = useCallback(
		(filter) =>
			setFilters((currentFilters) => {
				const filterIndex = currentFilters.indexOf(filter);

				if (filterIndex > -1) {
					setFilters([
						...currentFilters.slice(0, filterIndex),
						...currentFilters.slice(filterIndex + 1),
					]);
				} else {
					setFilters([...currentFilters, filter]);
				}
			}),
		[],
	);

	const onAllFilterToggle = useCallback(
		() =>
			setFilters((currentFilters) =>
				currentFilters.length === Object.keys(Filter).length ? [] : allFilters,
			),
		[],
	);

	const showControls =
		collatedPubEdgeValues.length > 1 && (!isolated || filteredPubEdgeValues.length > 1);

	const controls = showControls && (
		<>
			<PubEdgeListingCounter index={index} count={length} />
			<PubEdgeListingControls
				accentColor={accentColor}
				filters={filters}
				mode={mode}
				showFilterMenu={!isolated}
				onBackClick={back}
				onNextClick={next}
				onFilterToggle={onFilterToggle}
				onAllFilterToggle={onAllFilterToggle}
				onModeChange={setMode}
			/>
		</>
	);

	const renderContent = () => {
		return (
			!isolated && (
				<div className="top">
					<h5 style={{ color: accentColor }}>Related Pubs</h5>
					{controls}
				</div>
			)
		);
	};

	const renderCards = () => {
		const cards =
			mode === Mode.Carousel
				? activeEdgeValue && (
						<PubEdgeListingCard
							pubTitle={activeEdgeValue.pubTitle}
							pubEdge={activeEdgeValue.edge}
							accentColor={accentColor}
							showIcon={isolated}
							viewingFromSibling={activeEdgeValue.isSibling}
							inPubBody
						>
							{isolated && controls}
						</PubEdgeListingCard>
				  )
				: filteredPubEdgeValues.map(({ edge, isSibling, pubTitle }) => (
						<PubEdgeListingCard
							key={edge.url}
							pubTitle={pubTitle}
							pubEdge={edge}
							accentColor={accentColor}
							viewingFromSibling={isSibling}
							inPubBody
						/>
				  ));

		return !isolated && (!activeEdgeValue || filteredPubEdgeValues.length === 0) ? (
			<NonIdealState title="No Results" icon="search" />
		) : (
			cards
		);
	};

	if (initiallyRenderEmpty) {
		return null;
	}

	return (
		<div className={classNames('pub-edge-listing-component', className)}>
			{renderContent()}
			{renderCards()}
		</div>
	);
};

PubEdgeListing.propTypes = propTypes;
PubEdgeListing.defaultProps = defaultProps;
export default PubEdgeListing;
