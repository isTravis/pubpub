import React from 'react';

import { Layout } from 'components';
import { Pub } from 'types';
import { LayoutBlock, LayoutPubsByBlock } from 'utils/layout';

type Props = {
	pageData: {
		layoutPubsByBlock: LayoutPubsByBlock<Pub>;
		isNarrow: boolean;
		isNarrowWidth: boolean;
		layout: LayoutBlock[];
		communityId: string;
		title: string;
		slug: string;
	};
};

const Page = (props: Props) => {
	const { pageData } = props;

	return (
		<Layout
			blocks={pageData.layout}
			isNarrow={pageData.isNarrow || pageData.isNarrowWidth}
			layoutPubsByBlock={pageData.layoutPubsByBlock}
		/>
	);
};

export default Page;
