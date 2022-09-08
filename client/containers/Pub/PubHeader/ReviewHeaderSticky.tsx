import React, { useState } from 'react';
import { Button, AnchorButton } from '@blueprintjs/core';

import { usePageContext } from 'utils/hooks';
import { pubUrl } from 'utils/canonicalUrls';
import { Icon } from 'components';
import { apiFetch } from 'client/utils/apiFetch';
import { useLocalStorage } from 'client/utils/useLocalStorage';
import { getEmptyDoc } from 'client/components/Editor';
import { DocJson } from 'types';

import { usePubContext } from '../pubHooks';
import Review from './Review/Review';
import ReviewerDialog from './Review/ReviewerDialog';

require('./reviewHeaderSticky.scss');

const ReviewHeaderSticky = () => {
	const { pubData, updatePubData } = usePubContext();
	const {
		communityData,
		scopeData: {
			activePermissions: { canManage, canEdit },
			memberData,
		},
		loginData: { fullName },
	} = usePageContext();
	const { viewHash } = pubData;

	const [visible, setVisible] = useState(false);
	const [reviewTitle, setReviewTitle] = useState('Untitled Review');
	const [reviewerName, setReviewerName] = useState('');
	const [createError, setCreateError] = useState(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [createdReview, setCreatedReview] = useState(false);
	const [showReview, setShowReview] = useState(true);
	const [reviewNumber, setReviewNumber] = useState(0);
	const [saved, setSaved] = useState(false);

	// creates a docjoson object in local store, provides state handlers as well
	const { value: review, setValue: setReview } = useLocalStorage<DocJson>({
		initial: getEmptyDoc,
		communityId: communityData.id,
		featureName: 'new-review-editor',
		path: [`pub-${pubData.id}`],
		debounce: 100,
	});

	const updatingReviewDoc = (doc: DocJson) => {
		setReview(doc);
		setIsSaving(true);
		setTimeout(() => {
			setSaved(true);
			setIsSaving(false);
		}, 1000);
	};

	const url = new URL(window.location.href);
	const query = new URLSearchParams(url.search);
	const handleSubmit = () => {
		setIsLoading(true);
		apiFetch
			.post('/api/reviews', {
				communityId: communityData.id,
				pubId: pubData.id,
				reviewContent: review,
				title: reviewTitle,
				accessHash: query.get('access'),
				reviewerName,
			})
			.then((reviewRes) => {
				updatePubData((currentPubData) => {
					return currentPubData.reviews
						? {
								reviews: [...currentPubData.reviews, reviewRes],
						  }
						: {
								reviews: [reviewRes],
						  };
				});
				setIsLoading(false);
				setReviewNumber(reviewRes.number);
				setReview(getEmptyDoc());
				setCreatedReview(true);
			})
			.catch((err) => {
				setIsLoading(false);
				setCreateError(err);
			});
	};

	const renderReview = () => (
		<Review
			communityData={communityData}
			onSubmit={() => setVisible(true)}
			isLoading={isLoading}
			review={review}
			updateReview={updatingReviewDoc}
		/>
	);
	const reviewPath = `/dash/pub/${pubData.slug}/reviews/${reviewNumber}`;
	const isMember = memberData.length > 0;

	const pubPath =
		canManage && isMember
			? pubUrl(communityData, pubData)
			: pubUrl(communityData, pubData, { pubData: { viewHash } });
	const isUser = !!(canEdit || fullName);
	const reviewerFooterButtons = (
		<React.Fragment>
			<AnchorButton href={pubPath}>Return to Pub</AnchorButton>
			<AnchorButton intent="primary" href={reviewPath}>
				Go to Review
			</AnchorButton>
		</React.Fragment>
	);
	return (
		<div className="review-header-sticky-component container pub">
			<div className="sticky-section">
				<div className="sticky-title">{pubData.title}</div>
				<div className="side-content">
					{showReview && renderReview()}
					<div className="sticky-buttons">
						<div className="sticky-review-text">review</div>
						{isSaving && (
							<div className="saving-text">
								<em>Saving...</em>
							</div>
						)}
						{saved && !isSaving && <em className="saving-text">Saved</em>}
						<ReviewerDialog
							isOpen={visible}
							onClose={() => {
								setCreatedReview(false);
								setVisible(false);
							}}
							pubData={pubData}
							onCreateReviewDoc={handleSubmit}
							setReviewTitle={setReviewTitle}
							reviewTitle={reviewTitle}
							reviewerName={reviewerName}
							setReviewerName={setReviewerName}
							createdReview={createdReview}
							createError={createError}
							isUser={isUser}
							reviewerFooterButtons={reviewerFooterButtons}
						/>

						<Button
							minimal
							icon={<Icon icon="expand-all" />}
							onClick={() => setShowReview(!showReview)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ReviewHeaderSticky;
