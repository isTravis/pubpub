import React from 'react';
import { Icon } from 'components';

require('./overviewBlocks.scss');

type OwnProps = {
	pubs: any[];
	collections?: any[];
};

const defaultProps = {
	collections: undefined,
};

type Props = OwnProps & typeof defaultProps;

const OverviewBlocks = (props: Props) => {
	const { pubs, collections } = props;

	const countItems = (type) => {
		if (type === 'pubs') {
			return pubs.length;
		}
		if (type === 'collections') {
			// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
			return collections.length;
		}
		return pubs.reduce((count, pub) => {
			return count + pub[type].length;
		}, 0);
	};
	const types = [
		{ type: 'collections', icon: 'collection' as const },
		{ type: 'pubs', icon: 'pubDoc' as const },
		{ type: 'discussions', icon: 'chat' as const },
		{ type: 'reviews', icon: 'social-media' as const },
	];
	return (
		<div className="overview-blocks-component">
			{types
				.filter((item) => {
					return item.type !== 'collections' || collections;
				})
				.map((item, index) => {
					const itemCount = countItems(item.type);
					const itemName =
						itemCount === 1 ? item.type.slice(0, item.type.length - 1) : item.type;
					return (
						<React.Fragment key={item.type}>
							{index > 0 && <div className="blip">•</div>}
							<div className="overview-block">
								<Icon icon={item.icon} iconSize={18} />
								<div className="text">
									<span className="count">{itemCount}</span> {itemName}
								</div>
							</div>
						</React.Fragment>
					);
				})}
		</div>
	);
};
OverviewBlocks.defaultProps = defaultProps;
export default OverviewBlocks;
