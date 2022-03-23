import { Submission } from '../submission';
import { Diff } from '../util';

import { InsertableActivityItemBase } from './base';

type SubmissionActivityItemBase = InsertableActivityItemBase & {
	pubId: string;
	collectionId: string;
	payload: {
		submissionId: string;
		pub: {
			title: string;
		};
	};
};

export type SubmissionCreatedActivityItem = SubmissionActivityItemBase & {
	kind: 'submission-created';
};

export type SubmissionStatusUpdatedActivityItem = SubmissionActivityItemBase & {
	kind: 'submission-status-changed';
	payload: {
		status?: Diff<Submission['status']>;
	};
};

export type SubmissionDeletedActivityItem = SubmissionActivityItemBase & {
	kind: 'submission-deleted';
};

export type SubmissionActivityItem =
	| SubmissionCreatedActivityItem
	| SubmissionStatusUpdatedActivityItem
	| SubmissionDeletedActivityItem;
