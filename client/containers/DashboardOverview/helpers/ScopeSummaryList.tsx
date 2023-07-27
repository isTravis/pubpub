import React from 'react';
import dateFormat from 'dateformat';

import { Icon, IconName } from 'components';
import { Community, Collection, DefinitelyHas } from 'types';
import { getSchemaForKind } from 'utils/collections/schemas';
import { enIndefiniteArticle, capitalize } from 'utils/strings';
import { MinimalScopeSummary } from 'utils/scopeSummaries';

require('./scopeSummaryList.scss');

type Props = {
	scope: Omit<Community | Collection, 'scopeSummary'> & { scopeSummary: MinimalScopeSummary };
	scopeKind: 'collection' | 'community';
};

const ScopeSummaryList = (props: Props) => {
	const { scopeKind, scope } = props;
	const { collections, pubs, submissions, discussions, reviews } = scope.scopeSummary;

	const renderIntroText = () => {
		const createdDate = dateFormat(scope.createdAt, 'mmmm d, yyyy');
		if (scopeKind === 'community') {
			return <>This Community was created on {createdDate} and contains:</>;
		}
		if (scopeKind === 'collection') {
			const { label } = getSchemaForKind((scope as Collection).kind)!;
			return (
				<>
					This Collection is {enIndefiniteArticle(label.singular)}{' '}
					{capitalize(label.singular)}. It was created on {createdDate} and contains:
				</>
			);
		}
		return null;
	};

	const renderEntry = (title: React.ReactNode, count: number, iconName: IconName) => {
		return (
			<div className="entry">
				<Icon icon={iconName} iconSize={16} />
				<div className="label">
					<span className="count">{count}</span>
					&nbsp;
					{title}
				</div>
			</div>
		);
	};

	return (
		<div className="scope-summary-list-component">
			<p className="intro">{renderIntroText()}</p>
			{scopeKind === 'community' && renderEntry('Collections', collections, 'collection')}
			{renderEntry('Pubs', pubs, 'pubDoc')}
			{renderEntry('Submissions', submissions, 'manually-entered-data')}
			{renderEntry('Discussions', discussions, 'chat')}
			{renderEntry('Reviews', reviews, 'social-media')}
		</div>
	);
};

export default ScopeSummaryList;
