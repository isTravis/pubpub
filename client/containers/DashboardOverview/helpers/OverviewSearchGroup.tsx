import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { Tab, Tabs } from '@blueprintjs/core';

import { Icon } from 'components';
import { PubsQuery } from 'types';

require('./overviewSearchGroup.scss');

type SearchTermCallback = (q: string) => unknown;

export type OverviewSearchFilter = {
	id: string;
	title: string;
	query: null | Partial<PubsQuery>;
};

type Props = {
	placeholder: string;
	onUpdateSearchTerm?: SearchTermCallback;
	onCommitSearchTerm?: SearchTermCallback;
	onChooseFilter?: (q: null | Partial<PubsQuery>) => unknown;
	rightControls?: React.ReactNode;
	filter?: OverviewSearchFilter[];
};

const OverviewSearchGroup = (props: Props) => {
	const {
		placeholder,
		onCommitSearchTerm,
		onUpdateSearchTerm,
		rightControls,
		onChooseFilter,
		filter = [
			{ id: 'all', title: 'All', query: null },
			{
				id: 'latest',
				title: 'Latest',
				query: { ordering: { field: 'creationDate', direction: 'DESC' } },
			},
			{ id: 'drafts', title: 'Drafts', query: { isReleased: false } },
			{ id: 'released', title: 'Released', query: { isReleased: true } },
		],
	} = props;
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target as HTMLInputElement;
			if (onUpdateSearchTerm) {
				onUpdateSearchTerm(value.trim());
			}
		},
		[onUpdateSearchTerm],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			const { value } = e.target as HTMLInputElement;
			if (e.key === 'Enter' && onCommitSearchTerm) {
				onCommitSearchTerm(value.trim());
			}
		},
		[onCommitSearchTerm],
	);

	console.log(filter);
	const handleFilterChange = useCallback(
		(filterId: string) => {
			if (onChooseFilter) {
				const filterChange = filter.find((f) => f.id === filterId)!;
				onChooseFilter(filterChange.query);
			}
		},
		[filter, onChooseFilter],
	);

	return (
		<div className="overview-search-group-component">
			{onChooseFilter && (
				<Tabs
					className="filter-controls"
					id="overview-search-group-filter"
					onChange={handleFilterChange}
				>
					{filter.map((filtering) => (
						<Tab id={filtering.id} key={filtering.id} title={filtering.title} />
					))}
				</Tabs>
			)}
			<div className={classNames('search-bar', isSearchFocused && 'search-focused')}>
				<Icon icon="search" className="search-icon" iconSize={16} />
				<input
					placeholder={placeholder}
					onFocus={() => setIsSearchFocused(true)}
					onBlur={() => setIsSearchFocused(false)}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
				{rightControls && <div className="right-controls">{rightControls}</div>}
			</div>
		</div>
	);
};

export default OverviewSearchGroup;
