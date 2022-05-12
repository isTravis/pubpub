import React from 'react';

import Byline, { BylineProps } from 'components/Byline/Byline';
import { AttributionWithUser } from 'types';
import { usePageContext } from 'utils/hooks';
import { Tooltip, Icon } from '@blueprintjs/core';

// Review Note; I bet there's a better way to do this?
type Props = Omit<BylineProps, 'contributors'> & {
	contributors: AttributionWithUser[];
};

const WithinCommunityByline = (props: Props) => {
	const { communityData } = usePageContext();
	const { contributors } = props;
	let { bylinePrefix } = props;
	// TODO: Add function to get the sort option from community settings, and add other sort options
	if (communityData.id === '1a71ef4d-f6fe-40d3-8379-42fa2141db58') {
		contributors.sort((last, next) => {
			if (last.user.lastName > next.user.lastName) {
				return -1;
			}
			return 1;
		});
		bylinePrefix = (
			<Tooltip
				content="Contributors (A-Z)"
				children={<Icon iconSize={12} icon="sort-alphabetical" className="byline-icon" />}
			/>
		);
	}
	return <Byline {...props} bylinePrefix={bylinePrefix} contributors={contributors} />;
};
export default WithinCommunityByline;
