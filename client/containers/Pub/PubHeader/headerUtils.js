import React from 'react';
import { Position, Menu, MenuItem } from '@blueprintjs/core';

export const generateSubmissionButtons = (pubData) => {
	const defaultSubmissionBranch = pubData.branches.reduce((prev, curr) => {
		// if (!prev && curr.id !== pubData.activeBranch.id) {
		/* TODO-BRANCH: The check for title === 'public' is because we only want to support */
		/* publishing to a public branch until full branch capabilities are rolled out */
		if (curr.title === 'public' && curr.id !== pubData.activeBranch.id) {
			return curr;
		}
		return prev;
	}, undefined);

	/* TODO-BRANCH: this check to make sure the activeBranch is 'draft' is only */
	/* to valid until we roll out full branch features */
	if (pubData.activeBranch.title !== 'draft') {
		return null;
	}

	if (!defaultSubmissionBranch) {
		return null;
	}
	const outputButtons = [];
	/* TODO-BRANCH: Once we roll out full branch capabilities, we may want to rethink this language. */
	/* To change the button default to say Merge, into #branch. Rather than Publish, merge into #public */
	const buttonText = defaultSubmissionBranch.canManage ? 'Publish' : 'Submit for Review';
	const buttonSubText = defaultSubmissionBranch.canManage
		? `merge into #${defaultSubmissionBranch.title}`
		: `to #${defaultSubmissionBranch.title}`;
	outputButtons.push({
		text: (
			<div className="text-stack">
				<span>{buttonText}</span>
				<span className="action-subtext">{buttonSubText}</span>
			</div>
		),
		href: `/pub/${pubData.slug}/submissions/new/${pubData.activeBranch.shortId}/${defaultSubmissionBranch.shortId}`,
		isWide: true,
	});

	/* TODO-BRANCH: The following 'false' is because we only want to support publishing */
	/* to a public branch until full branch capabilities are rolled out */
	// eslint-disable-next-line no-constant-condition
	if (false && pubData.branches.length > 2) {
		outputButtons.push({
			// text: 'hello',
			rightIcon: 'caret-down',
			isSkinny: true,
			popoverProps: {
				content: (
					<Menu>
						{pubData.branches
							.filter((branch) => {
								return (
									branch.id !== pubData.activeBranch.id &&
									branch.id !== defaultSubmissionBranch.id
								);
							})
							.map((branch) => {
								return (
									<MenuItem
										key={branch.id}
										href={`/pub/${pubData.slug}/submissions/new/${pubData.activeBranch.shortId}/${branch.shortId}`}
										text={
											<div className="text-stack">
												<span>{branch.submissionAlias || 'To'}</span>
												<span className="subtext">
													branch: {branch.title}
												</span>
											</div>
										}
									/>
								);
							})}
					</Menu>
				),
				minimal: true,
				popoverClassName: 'action-button-popover right-aligned-skewed',
				position: Position.BOTTOM_RIGHT,
			},
		});
	}
	return outputButtons;
};

export const generateHeaderBreadcrumbs = (pubData, locationData) => {
	const { mode, slug } = pubData;
	const sections = {
		merge: [{ text: 'Merge' }],
		reviewCreate: [{ text: 'New Review' }],
		reviews: [{ text: 'Reviews' }],
		review: [
			{ text: 'Reviews', href: `/pub/${slug}/reviews` },
			{ text: locationData.params.reviewShortId },
		],
		manage: [{ text: 'Manage' }],
		branchCreate: [{ text: 'New Branch' }],
	};
	const sectionData = sections[mode];
	if (!sectionData) {
		return null;
	}
	return sectionData.map((data) => {
		return (
			<span key={data.text} className="breadcrumb">
				{data.href ? (
					<a key={data.text} href={data.href}>
						{data.text}
					</a>
				) : (
					data.text
				)}
			</span>
		);
	});
};

// The "formatted download" is the file that the pub manager can upload themselves to represent the
// pub. It's stored in pub.downloads, but it's treated as a kind of special case.
export const getFormattedDownload = (downloads) => {
	if (!downloads) {
		return null;
	}
	return downloads.reduce((prev, curr) => {
		const currIsNewer = !prev || !prev.createdAt || curr.createdAt > prev.createdAt;
		if (curr.type === 'formatted' && currIsNewer) {
			return curr;
		}
		return prev;
	}, null);
};

// Finds a download for the given branchId and formatType
export const getExistingDownload = (downloads, branchId, formatType) => {
	return downloads.find((download) => {
		const sameBranch = download.branchId === branchId;
		const sameType = download.type === formatType.format;
		return sameType && sameBranch;
	});
};

export const getTocHeadings = (docJson) => {
	return docJson.content
		.filter((item) => {
			return item.type === 'heading' && item.attrs.level < 3;
		})
		.map((item, index) => {
			const textContent =
				item.content &&
				item.content
					.filter((node) => {
						/* Filter to remove inline non-text nodes: e.g. equations */
						return node.type === 'text';
					})
					.reduce((prev, curr) => {
						return `${prev}${curr.text}`;
					}, '');
			return {
				title: textContent,
				level: item.attrs.level,
				href:
					textContent &&
					textContent
						.replace(/[^a-zA-Z0-9-\s]/gi, '')
						.replace(/\s+/gi, ' ')
						.trim()
						.toLowerCase()
						.replace(/\s/gi, '-'),
				index: index,
			};
		})
		.filter((item) => {
			/* Filter out empty headers */
			return item.title;
		});
};
