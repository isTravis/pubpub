import React from 'react';
import { Button } from '@blueprintjs/core';

import { usePageContext } from 'utils/hooks';
import { getSchemaForKind } from 'utils/collections/schemas';
import { MenuButton, MenuItem, MenuItemDivider } from 'components/Menu';

type Props = {
	collection: {
		isPublic?: boolean;
		kind?: string;
	};
	collectionPub: any;
	setCollectionPubContextHint: (...args: any[]) => any;
	setCollectionPubIsPrimary: (...args: any[]) => any;
	removeCollectionPub: (...args: any[]) => any;
};

const PubMenu = (props: Props) => {
	const {
		collectionPub,
		collection,
		setCollectionPubContextHint,
		setCollectionPubIsPrimary,
		removeCollectionPub,
	} = props;
	const { scopeData } = usePageContext();
	const { canManage } = scopeData.activePermissions;
	const { activeCollection } = scopeData.elements;
	const collectionSchema = getSchemaForKind(activeCollection.kind);
	const canSetCollectionAsPrimary = collection.isPublic && collection.kind !== 'tag';

	if (!canManage) {
		return null;
	}
	return (
		<React.Fragment>
			<MenuButton
				aria-label="More pub options"
				buttonProps={{
					small: true,
					minimal: true,
					icon: 'more',
				}}
				placement="bottom-end"
			>
				{canSetCollectionAsPrimary && (
					<>
						<MenuItem
							text="Use as primary collection"
							icon={collectionPub.isPrimary ? 'tick' : 'blank'}
							onClick={() =>
								setCollectionPubIsPrimary(collectionPub, !collectionPub.isPrimary)
							}
						/>
						<MenuItemDivider />
					</>
				)}
				<MenuItem
					text={<i>(No label)</i>}
					icon={!collectionPub.contextHint ? 'tick' : 'blank'}
					onClick={() => setCollectionPubContextHint(collectionPub, null)}
				/>
				{/* @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'. */}
				{collectionSchema.contextHints.map((hint) => (
					<MenuItem
						key={hint.value}
						text={hint.label}
						icon={collectionPub.contextHint === hint.value ? 'tick' : 'blank'}
						onClick={() => setCollectionPubContextHint(collectionPub, hint.value)}
					/>
				))}
			</MenuButton>
			<Button
				small
				minimal
				icon="cross"
				aria-label="Remove this Pub from collection"
				onClick={() => removeCollectionPub(collectionPub)}
			/>
		</React.Fragment>
	);
};
export default PubMenu;
