import React from 'react';
import { Button } from 'reakit/Button';

import { Byline, GridWrapper, ContributorAvatars, Icon, ClickToCopyButton } from 'components';
import { Collection } from 'types';
import { LayoutBlockCollectionHeader } from 'utils/layout/types';
import { getAllCollectionContributors } from 'utils/contributors';
import getCollectionDoi from 'utils/collections/getCollectionDoi';
import { getSchemaForKind } from 'utils/collections/schemas';
import { capitalize } from 'utils/strings';
import { formatDate } from 'utils/dates';

require('./layoutCollectionHeader.scss');

type Props = {
	collection: Collection;
	content: LayoutBlockCollectionHeader['content'];
};

const LayoutCollectionHeader = (props: Props) => {
	const {
		collection,
		content: { hideByline, hideContributors, hideCollectionKind, hideDate, hideDoi },
	} = props;
	const contributors = getAllCollectionContributors(collection);
	const bylineContributors = contributors.filter((c) => c.isAuthor);
	const schema = getSchemaForKind(collection.kind)!;
	const doi = getCollectionDoi(collection);
	const metadata = collection?.metadata;
	console.table(metadata);
	console.log(Object.entries(metadata));
	const detailsRowElements = [
		!hideCollectionKind && (
			<div className="collection-kind" key={0}>
				<Icon icon={schema.bpDisplayIcon} />
				{capitalize(schema.label.singular)}
			</div>
		),
		!hideDate && <div key={1}>Created {formatDate(collection.createdAt)}</div>,
		doi && !hideDoi && (
			<ClickToCopyButton
				className="click-to-copy"
				copyString={`https://doi.org/${doi}`}
				beforeCopyPrompt="Copy doi.org link"
				icon={null}
				small
				key={2}
			>
				{(handleClick) => (
					<Button as="a" onClick={handleClick}>
						{doi}
					</Button>
				)}
			</ClickToCopyButton>
		),
		Object.entries(metadata).map((data) => {
			return (
				<div key={3} className="collection-kind">
					{data[1]}
				</div>
			);
		}),
	].filter((x) => x);

	return (
		<div className="layout-collection-header-component">
			<GridWrapper columnClassName="inner">
				<h1>{collection.title}</h1>
				{bylineContributors && !hideByline && (
					<Byline
						contributors={bylineContributors}
						renderSuffix={() => {
							return (
								!hideContributors &&
								contributors.length > 0 && (
									<ContributorAvatars
										attributions={contributors}
										truncateAt={8}
									/>
								)
							);
						}}
					/>
				)}
				{detailsRowElements.length > 0 && (
					<div className="details-row">{detailsRowElements}</div>
				)}
			</GridWrapper>
		</div>
	);
};

export default LayoutCollectionHeader;
