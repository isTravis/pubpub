import React, { useCallback } from 'react';
import { Checkbox, Button } from '@blueprintjs/core';

import { InputField, Popover } from 'components';
import { LayoutCollectionHeader } from 'components/Layout';
import { Collection } from 'types';
import { LayoutBlockCollectionHeader } from 'utils/layout/types';
import getCollectionDoi from 'utils/collections/getCollectionDoi';
import Metadata from './getMetaDataChecklist';

type Content = LayoutBlockCollectionHeader['content'];

type Props = {
	onChange: (index: number, content: Partial<Content>) => any;
	layoutIndex: number;
	block: LayoutBlockCollectionHeader;
	collection: Collection;
};

const LayoutEditorCollectionHeader = (props: Props) => {
	const { onChange: fullOnChange, layoutIndex, block, collection } = props;
	const { hideDoi, hideCollectionKind, hideByline, hideContributors, hideDate } = block.content;
	const doi = getCollectionDoi(collection);

	const onChange = useCallback((update: Partial<Content>) => fullOnChange(layoutIndex, update), [
		fullOnChange,
		layoutIndex,
	]);

	const renderMetadataElements = () => {
		return (
			<Popover
				aria-label="Choose preview elements"
				content={
					<Metadata
						content={block.content}
						collection={collection}
						onChangeContent={onChange}
					/>
				}
			>
				<Button outlined icon="settings" rightIcon="caret-down">
					Metadata fields
				</Button>
			</Popover>
		);
	};
	const renderPreviewElements = () => {
		return (
			<InputField label="Preview Elements">
				<Checkbox
					checked={!hideByline}
					onChange={() => onChange({ hideByline: !hideByline })}
					label="Byline"
				/>
				<Checkbox
					disabled={hideByline}
					checked={hideByline ? false : !hideContributors}
					onChange={() => onChange({ hideContributors: !hideContributors })}
					label="Contributors"
				/>
				<Checkbox
					checked={!hideCollectionKind}
					onChange={() => onChange({ hideCollectionKind: !hideCollectionKind })}
					label="Collection kind"
				/>
				<Checkbox
					checked={!hideDate}
					onChange={() => onChange({ hideDate: !hideDate })}
					label="Creation date"
				/>
				<Checkbox
					disabled={!doi}
					checked={doi ? !hideDoi : false}
					onChange={() => onChange({ hideDoi: !hideDoi })}
					label="DOI"
				/>
				<div className="controls-row">{renderMetadataElements()}</div>
			</InputField>
		);
	};

	return (
		<div className="layout-editor-collection-header-component">
			<div className="block-header">{renderPreviewElements()}</div>
			<LayoutCollectionHeader collection={collection} content={block.content} />
		</div>
	);
};
export default LayoutEditorCollectionHeader;
