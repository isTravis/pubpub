import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import dateFormat from 'dateformat';

import { Pub } from 'utils/types';
import { getResizedUrl } from 'utils/images';
import { getPubPublishedDate } from 'utils/pub/pubDates';
import { isPubPublic } from 'utils/pub/permissions';
import { getAllPubContributors } from 'utils/pub/contributors';
import { communityUrl, bestPubUrl } from 'utils/canonicalUrls';
import { usePageContext } from 'utils/hooks';
import { Avatar, Icon, PreviewImage } from 'components';

import ExpandButton from './ExpandButton';
import ManyAuthorsByline from './ManyAuthorsByline';
import PubPreviewEdges from './PubPreviewEdges';

require('./pubPreview.scss');

type Props = {
	pubData: Pub;
	communityData?: any;
	size?: string;
	hideByline?: boolean;
	hideDescription?: boolean;
	hideDates?: boolean;
	hideContributors?: boolean;
	hideEdges?: boolean;
	customPubUrl?: string;
};

const PubPreview = (props: Props) => {
	const {
		communityData,
		customPubUrl = null,
		hideByline = false,
		hideContributors = false,
		hideDates = false,
		hideDescription = false,
		hideEdges = false,
		pubData,
		size = 'large',
	} = props;
	const { communityData: localCommunityData, scopeData } = usePageContext();
	const [isExpanded, setIsExpanded] = useState(false);
	const [canExpand, setCanExpand] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const resizedHeaderLogo =
		communityData && getResizedUrl(communityData.headerLogo, 'fit-in', '125x35');
	const publishedDate = getPubPublishedDate(pubData);
	const isPrivate = !isPubPublic(pubData, scopeData);
	const showBannerImage = ['large', 'medium'].includes(size);
	const showUpperByline = !hideByline && ['minimal'].includes(size);
	const showLowerByline = !hideByline && ['large', 'medium', 'small'].includes(size);
	const showDates = !hideDates && ['large', 'medium', 'small'].includes(size);
	const showContributors = !hideContributors && ['large', 'medium', 'small'].includes(size);
	const showDescription = pubData.description && !hideDescription;
	const showExpandButton = canExpand && ['large', 'medium'].includes(size);
	const pubLink =
		customPubUrl ||
		bestPubUrl({ pubData: pubData, communityData: communityData || localCommunityData });

	const renderByline = () => (
		<ManyAuthorsByline
			truncateAt={8}
			pubData={pubData}
			linkToUsers={false}
			isExpanded={isExpanded}
		/>
	);

	useEffect(() => {
		const { current: contentEl } = contentRef;
		if (contentEl && contentEl.scrollHeight - contentEl.clientHeight > 0) {
			setCanExpand(true);
		}
	}, []);

	return (
		<div
			className={classNames(
				'pub-preview-component',
				`${size}-preview`,
				isExpanded && 'expanded',
			)}
		>
			<div className="preview-image-wrapper">
				{showBannerImage && (
					<a href={pubLink} title={pubData.title}>
						<PreviewImage src={pubData.avatar} title={pubData.title} />
					</a>
				)}
			</div>
			<div className="content-wrapper">
				<div className="content" ref={contentRef}>
					{showUpperByline && (
						<div
							className="authors"
							style={{ color: localCommunityData.accentColorDark }}
						>
							{renderByline()}
						</div>
					)}
					<div className="title-wrapper">
						{communityData && (
							<a
								href={communityUrl(communityData)}
								title={communityData.title}
								className="community-banner"
								style={{ backgroundColor: communityData.accentColorDark }}
							>
								<img
									alt={`in Community ${communityData.title}`}
									src={resizedHeaderLogo}
								/>
							</a>
						)}
						<a href={pubLink} title={pubData.title}>
							<h3 className="pub-title">
								{pubData.title}
								{isPrivate && <Icon className="lock-icon" icon="lock2" />}
							</h3>
						</a>
					</div>

					{showLowerByline && <div className="authors">{renderByline()}</div>}

					{showContributors && (
						<div className="author-avatars">
							{getAllPubContributors(pubData).map((contributor, index) => {
								return (
									<Avatar
										key={`avatar-${contributor.id}`}
										instanceNumber={index}
										initials={contributor.user.initials}
										avatar={contributor.user.avatar}
										borderColor="rgba(255, 255, 255, 1.0)"
										width={20}
										doesOverlap={true}
									/>
								);
							})}
						</div>
					)}

					{showDates && (
						<div className="date-details">
							{publishedDate ? (
								<span className="date">
									Published: {dateFormat(publishedDate, 'mmm dd, yyyy')}
								</span>
							) : (
								<span className="date">Unpublished</span>
							)}
						</div>
					)}

					{showDescription && <div className="description">{pubData.description}</div>}
					{!hideEdges && (
						<PubPreviewEdges
							pubData={pubData}
							accentColor={localCommunityData.accentColorDark}
						/>
					)}
				</div>
				{showExpandButton && (
					<ExpandButton
						accentColor={localCommunityData.accentColorDark}
						isExpanded={isExpanded}
						onClick={() => setIsExpanded(!isExpanded)}
					/>
				)}
			</div>
		</div>
	);
};

export default PubPreview;
