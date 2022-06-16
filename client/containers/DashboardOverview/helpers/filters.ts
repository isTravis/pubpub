import { PubsQuery } from 'types';
import { pruneFalsyValues } from 'utils/arrays';

export type OverviewSearchFilter = {
	id: string;
	title: string;
	query: null | Partial<PubsQuery>;
};

type GetDefaultOverviewSearchFiltersOptions = {
	isViewMember: boolean;
	userId: null | string;
};

export const getDefaultOverviewSearchFilters = (
	options: GetDefaultOverviewSearchFiltersOptions,
): OverviewSearchFilter[] => {
	const { isViewMember, userId } = options;
	return pruneFalsyValues([
		{ id: 'all', title: 'All', query: null },
		{
			id: 'latest',
			title: 'Latest',
			query: { ordering: { field: 'creationDate', direction: 'DESC' } },
		},
		isViewMember && { id: 'drafts', title: 'Drafts', query: { isReleased: false } },
		{ id: 'released', title: 'Released', query: { isReleased: true } },
		isViewMember && {
			id: 'mine',
			title: 'Mine',
			query: {
				relatedUserIds: [userId!],
				ordering: { field: 'creationDate', direction: 'DESC' },
			},
		},
	]);
};
