import React, { useState } from 'react';
import { Button, NonIdealState } from '@blueprintjs/core';

import { MinimalEditor } from 'components';
import { apiFetch } from 'client/utils/apiFetch';
import { DocJson } from 'types';

require('./reviewEditor.scss');

const ReviewEditor = () => {
	const [review, setReview] = useState({} as DocJson);
	const [createIsLoading, setCreateIsLoading] = useState(false);
	const [createError, setCreateError] = useState(undefined);

	const cacheReviewDoc = (newReview: DocJson) => {
		setReview(newReview);
	};

	const createReviewDoc = () => {
		return apiFetch
			.put('/api/review', {
				abstract: review,
				id: 'fails',
			})
			.then(() => {
				setCreateIsLoading(false);
				setCreateError(undefined);
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
					onEdit={(doc) => cacheReviewDoc(doc.toJSON() as DocJson)}
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
