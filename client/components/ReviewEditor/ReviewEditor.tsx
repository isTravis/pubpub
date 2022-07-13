import React, { useState } from 'react';
import { Button, NonIdealState } from '@blueprintjs/core';

import { MinimalEditor } from 'components';
import { apiFetch } from 'client/utils/apiFetch';
import { DocJson } from 'types';

require('./reviewEditor.scss');

type Props = {
	pubData: any;
	updatePubData: (...args: any[]) => any;
	communityData: any;
};

const ReviewEditor = (props: Props) => {
	const { pubData, updatePubData, communityData } = props;
	// need to set loading on doc updates
	const [reviewDoc, setReviewDoc] = useState({} as DocJson);
	const [createIsLoading, setCreateIsLoading] = useState(false);
	const [createError, setCreateError] = useState(undefined);

	const createReviewDoc = () => {
		setCreateIsLoading(true);
		return apiFetch
			.post('/api/reviews', {
				communityId: communityData.id,
				pubId: pubData.id,
				review: reviewDoc,
				title: 'anonymous',
			})
			.then((review) => {
				setCreateIsLoading(false);
				setCreateError(undefined);
				updatePubData((currentPubData) => {
					return {
						reviews: [...currentPubData.reviews, review],
					};
				});
				window.location.href = `/dash/pub/${pubData.slug}/reviews/${review.number}`;
			})
			.catch((err) => {
				setCreateIsLoading(false);
				setCreateError(err);
			});
	};

	const sharedProps = {
		customNodes: { doc: { content: 'paragraph' } },
		constrainHeight: true,
	};

	return (
		<div className="review-editor">
			<div className="review-editor-component">
				<MinimalEditor
					{...sharedProps}
					getButtons={(buttons) => buttons.minimalButtonSet}
					onEdit={(doc) => setReviewDoc(doc.toJSON() as DocJson)}
					debounceEditsMs={300}
					useFormattingBar
					focusOnLoad={true}
				/>
			</div>
			<Button onClick={createReviewDoc} loading={createIsLoading}>
				This button kinda lit
			</Button>
			{createError && (
				<NonIdealState
					title="Something something errors"
					// @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: string; visual: string; action: Ele... Remove this comment to see the full error message
					visual="error"
					action={
						<a href="/login?redirect=/community/create" className="bp3-button">
							Login or Signup
						</a>
					}
				/>
			)}
		</div>
	);
};

export default ReviewEditor;
