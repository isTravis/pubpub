import { Pub } from 'types';

export const managerStatuses = ['submitted', 'accepted', 'declined'] as const;
export const submitterStatuses = ['submitted'] as const;
export const initialStatuses = ['incomplete'] as const;

export const submissionStatuses = [
	...initialStatuses,
	...managerStatuses,
	...submitterStatuses,
] as const;

export type Submission = {
	id: string;
	pubId: string;
	pub?: Pub;
	status: typeof submissionStatuses;
};
