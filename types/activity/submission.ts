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

export type SubmissionUpdatedActivityItem = SubmissionActivityItemBase & {
	kind: 'submission-status-updated';
	payload: {
		status: Diff<Exclude<Submission['status'], 'incomplete'>>;
	};
};

export type SubmissionActivityItem = SubmissionUpdatedActivityItem;
