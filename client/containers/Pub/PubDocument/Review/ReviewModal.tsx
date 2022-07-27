import React, { useState } from 'react';
import { Button, NonIdealState } from '@blueprintjs/core';

import { apiFetch } from 'client/utils/apiFetch';
import { DialogLauncher } from 'components';
import { DocJson, PubPageData, Community } from 'types';
import { usePageContext } from 'utils/hooks';

import ReviewerDialog from './ReviewerDialog';

type Props = {
	isLoading: boolean;
	pubData: PubPageData;
	communityData: Community;
	updatePubData: any;
	reviewDoc: DocJson;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ReviewModal = (props: Props) => {
	const { isLoading, pubData, communityData, updatePubData, reviewDoc, setIsLoading } = props;
	const {
		scopeData: { activePermissions },
		loginData: { fullName },
	} = usePageContext();
	const [reviewTitle, setReviewTitle] = useState('Untilted Review');
	const [reviewerName, setReviewerName] = useState(fullName || 'anonymous');
	const [createError, setCreateError] = useState(undefined);
	const isUser = !!(activePermissions.canEdit || fullName);
	const redirectUrl = (review) =>
		isUser ? `/dash/pub/${pubData.slug}/reviews/${review.number}` : `/signup`;
	const saveReviewerName = (review) => {
		return apiFetch
			.post('/api/reviewer', {
				id: review.id,
				name: reviewerName,
				permissions: activePermissions,
			})
			.catch((err) => {
				setIsLoading(false);
				setCreateError(err);
			});
	};
	const createReviewDoc = () => {
		setIsLoading(true);
		apiFetch
			.post('/api/reviews', {
				communityId: communityData.id,
				pubId: pubData.id,
				reviewContent: reviewDoc,
				title: reviewTitle,
				permissions: activePermissions,
			})
			.then((review) => {
				saveReviewerName(review);
				updatePubData((currentPubData) => {
					return {
						reviews: [...currentPubData.reviews, review],
					};
				});
				setIsLoading(false);
				window.location.href = redirectUrl(review);
			})
			.catch((err) => {
				setIsLoading(false);
				setCreateError(err);
			});
	};

	return (
		<div>
			<DialogLauncher
				renderLauncherElement={({ openDialog }) => (
					<Button
						icon="document-share"
						onClick={openDialog}
						minimal={true}
						loading={isLoading}
					>
						Submit Review
					</Button>
				)}
			>
				{({ isOpen, onClose, key }) => (
					<ReviewerDialog
						key={key}
						isOpen={isOpen}
						onClose={onClose}
						pubData={pubData}
						onCreateReviewDoc={createReviewDoc}
						setReviewTitle={setReviewTitle}
						reviewTitle={reviewTitle}
						reviewerName={reviewerName}
						setReviewerName={setReviewerName}
						isUser={isUser}
					/>
				)}
			</DialogLauncher>

			{createError && (
				<NonIdealState
					title="There was an error submitting your review"
					// @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: string; visual: string; action: Ele... Remove this comment to see the full error message
					visual="error"
					action={
						<a href="/login" className="bp3-button">
							Login or Signup
						</a>
					}
				/>
			)}
		</div>
	);
};

export default ReviewModal;
