import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'reakit';
import dateFormat from 'dateformat';

import { Icon, DashboardRow } from 'components';
import { generateAuthorString } from 'components/PubPreview/pubPreviewUtils';
import { splitThreads } from 'utils';
import { getDashUrl } from 'utils/dashboard';

require('./overviewRow.scss');

const propTypes = {
	children: PropTypes.node,
	content: PropTypes.object.isRequired,
	controls: PropTypes.node,
	dragHandleProps: PropTypes.object,
	isDragging: PropTypes.bool,
	label: PropTypes.node,
	minimal: PropTypes.bool,
	onClick: PropTypes.func,
	parentSlug: PropTypes.string,
	selected: PropTypes.bool,
};

const defaultProps = {
	children: null,
	controls: null,
	dragHandleProps: null,
	isDragging: false,
	label: null,
	onClick: null,
	parentSlug: undefined,
	minimal: false,
	selected: false,
};

const getCounts = (isCollection, content) => {
	const countReviews = isCollection
		? content.pubs.reduce((prev, curr) => {
				return prev + splitThreads(curr.threads).reviews.length;
		  }, 0)
		: splitThreads(content.threads).reviews.length;

	const countConversations = isCollection
		? content.pubs.reduce((prev, curr) => {
				return prev + splitThreads(curr.threads).discussions.length;
		  }, 0)
		: splitThreads(content.threads).discussions.length;

	const countForks = isCollection
		? content.pubs.reduce((prev, curr) => {
				const forks = splitThreads(curr.threads).forks || [];
				return prev + forks.length;
		  }, 0)
		: splitThreads(content.threads).forks.length;

	return {
		countReviews: countReviews,
		countConversations: countConversations,
		countForks: countForks,
	};
};

const getHref = (isCollection, slug, parentSlug) => {
	return getDashUrl({
		collectionSlug: isCollection ? slug : parentSlug,
		pubSlug: isCollection ? undefined : slug,
	});
};

const OverviewRow = (props) => {
	const {
		content,
		controls,
		dragHandleProps,
		isDragging,
		label,
		onClick,
		parentSlug,
		minimal,
		selected,
		children,
	} = props;
	const isCollection = content.pubs;
	const authorString = generateAuthorString(content);
	const hasAuthors = content.attributions && content.attributions.some((a) => a.isAuthor);
	const slug = content.slug || content.title.toLowerCase().replace(/ /gi, '-');
	const href = !onClick && getHref(isCollection, slug, parentSlug);
	const { countConversations, countForks, countReviews } = getCounts(isCollection, content);
	const [showChildren, setShowChildren] = useState(false);
	const showArrow = React.Children.count(children) > 0;

	const renderHandle = () => {
		return (
			dragHandleProps && (
				<div {...dragHandleProps} className="drag-handle">
					<Icon icon="drag-handle-vertical" />
				</div>
			)
		);
	};

	const renderSubtitle = () => {
		return (
			<React.Fragment>
				{label}
				{label && hasAuthors && ' • '}
				{authorString}
			</React.Fragment>
		);
	};

	const renderInitialRelease = (item) => {
		const releases = item.releases || [];
		const firstRelease = releases.reduce((prev, curr) => {
			if (!prev) {
				return curr.createdAt;
			}
			return prev < curr.createdAt ? prev : curr.createdAt;
		}, null);
		return firstRelease ? dateFormat(firstRelease, 'mmm dd, yyyy') : '-';
	};
	// const renderCounts = () => {
	// 	if (minimal) {
	// 		return null;
	// 	}
	// 	return (
	// 		<div className="counts">
	// 			{isCollection && (
	// 				<div className="pubs" aria-label={`${content.pubs.length} pubs`}>
	// 					<Icon icon="pubDoc" iconSize={14} />
	// 					<span aria-hidden="true">{content.pubs.length}</span>
	// 				</div>
	// 			)}
	// 			<div className="conversations" aria-label={`${countConversations} conversations`}>
	// 				<Icon icon="chat2" iconSize={14} />
	// 				<span aria-hidden="true">{countConversations}</span>
	// 			</div>
	// 			<div className="merges" aria-label={`${countForks} forks`}>
	// 				<Icon icon="git-pull" iconSize={14} />
	// 				<span aria-hidden="true">{countForks}</span>
	// 			</div>
	// 			<div className="reviews" aria-label={`${countReviews} reviews`}>
	// 				<Icon icon="social-media" iconSize={14} />
	// 				<span aria-hidden="true">{countReviews}</span>
	// 			</div>
	// 		</div>
	// 	);
	// };

	// const renderRightSide = () => {
	// 	return (
	// 		<React.Fragment>
	// 			{renderCounts()}
	// 			{controls && <div className="controls">{controls}</div>}
	// 		</React.Fragment>
	// 	);
	// };

	return (
		<div
			className={classNames(
				'overview-row-component',
				isDragging && 'is-dragging bp3-elevation-2',
				minimal && 'minimal',
			)}
			aria-expanded={showChildren}
			role={isCollection ? 'listitem' : undefined}
		>
			<div className="inner">
				<div className="handle">
					{isCollection ? (
						<Button
							aria-label={
								showChildren
									? 'Hide collection children'
									: 'Show collection children'
							}
							className={classNames({
								arrow: true,
								active: showArrow,
								opened: showChildren,
							})}
							tabIndex={showArrow ? 0 : -1}
							onClick={(evt) => {
								if (showArrow) {
									evt.preventDefault();
									setShowChildren(!showChildren);
								}
							}}
						>
							{showArrow && <Icon icon="caret-right" />}
						</Button>
					) : (
						renderHandle()
					)}
				</div>
				<div className="type">
					<Icon icon={isCollection ? 'collection' : 'pubDoc'} iconSize={14} />
				</div>
				<a className="title" href={href} onClick={onClick} draggable="false">
					<div className="item-title">{content.title}</div>
					<div className="subtitle">{renderSubtitle()}</div>
				</a>
				<div className="pubs">{isCollection ? content.pubs.length : '-'}</div>
				<div className="released">{renderInitialRelease(content)}</div>
				<div className="discussions">{countConversations}</div>
				<div className="reviews">{countReviews}</div>
				<div className="pub-options">{controls}</div>
			</div>
			{showChildren && <div className="child-rows">{children}</div>}
		</div>
	);
};

OverviewRow.propTypes = propTypes;
OverviewRow.defaultProps = defaultProps;
export default OverviewRow;

// <DashboardRow
// 	onClick={onClick}
// 	className={classNames(
// 		'overview-row-component',
// 		isDragging && 'is-dragging bp3-elevation-2',
// 		minimal && 'minimal',
// 	)}
// 	href={href}
// 	handle={renderHandle()}
// 	title={content.title}
// 	subtitle={renderSubtitle()}
// 	rightSideElements={renderRightSide()}
// 	icon={isCollection ? 'collection' : 'pubDoc'}
// 	selected={selected}
// >
// 	{isCollection &&
// 		content.pubs.map((pub) => {
// 			return (
// 				<OverviewRow
// 					key={`${content.id}-${pub.id}`}
// 					content={pub}
// 					parentSlug={slug}
// 				/>
// 			);
// 		})}
// </DashboardRow>
