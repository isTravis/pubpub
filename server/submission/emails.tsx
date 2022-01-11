import React from 'react';
import ReactDOMServer from 'react-dom/server';

import * as types from 'types';
import { SubmissionEmail, Editor } from 'components';
import { Community, SubmissionWorkflow, User } from 'server/models';
import { sendEmail } from 'server/utils/email';

type SendEmailOptions = {
	previousStatus: types.SubmissionStatus;
	submission: types.Submission & { pub: types.DefinitelyHas<types.Pub, 'members'> };
	customText?: types.DocJson;
};

const getEmailKindToSend = (
	previousStatus: types.SubmissionStatus,
	currentStatus: types.SubmissionStatus,
): null | types.SubmissionEmailKind => {
	if (previousStatus === 'incomplete' && currentStatus === 'pending') {
		return 'received';
	}
	if (previousStatus === 'pending' && currentStatus === 'accepted') {
		return 'accepted';
	}
	if (previousStatus === 'pending' && currentStatus === 'declined') {
		return 'declined';
	}
	return null;
};

const getSubmittersInfo = async (members: types.Member[]) => {
	const pubMembers = members.filter((m) => !!m.pubId);
	const [earliestAddedMember] = pubMembers.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
	const users: { id: string; fullName: string; email: string }[] = await User.findAll({
		where: { id: pubMembers.map((m) => m.userId) },
		attributes: ['id', 'fullName', 'email'],
		orderBy: [['createdAt', 'ASC']],
	});
	const earliestAddedUser = users.find((u) => u.id === earliestAddedMember.userId);
	return {
		submitterName: earliestAddedUser?.fullName ?? 'Submitter',
		submitterEmails: users.map((u) => u.email),
	};
};

const deriveEmailCustomText = (
	emailKind: types.SubmissionEmailKind,
	submissionWorkflow: types.SubmissionWorkflow,
	customText: types.Maybe<types.DocJson>,
) => {
	if (customText) {
		return customText;
	}
	if (emailKind === 'received') {
		return submissionWorkflow.emailText;
	}
	return null;
};

export const sendSubmissionEmail = async (options: SendEmailOptions) => {
	const { previousStatus, submission, customText: providedCustomText } = options;
	const emailKind = getEmailKindToSend(previousStatus, submission.status);
	if (emailKind) {
		const { submitterName, submitterEmails } = await getSubmittersInfo(submission.pub.members);
		const [community, submissionWorkflow]: [types.Community, types.SubmissionWorkflow] =
			await Promise.all([
				Community.findOne({ where: { id: submission.pub.communityId } }),
				SubmissionWorkflow.findOne({
					where: { id: submission.submissionWorkflowId },
				}),
			]);
		const customText = deriveEmailCustomText(emailKind, submissionWorkflow, providedCustomText);
		const html = ReactDOMServer.renderToString(
			<SubmissionEmail
				kind={emailKind}
				customText={customText && <Editor initialContent={customText} isReadOnly />}
				submissionTitle={submission.pub.title}
				submitterName={submitterName}
				community={community}
			/>,
		);
		await sendEmail({
			from: { address: 'submissions@pubpub.org', name: `PubPub Submissions` },
			to: [...submitterEmails, submissionWorkflow.targetEmailAddress],
			subject: `Your submission to ${community.title}`,
			html,
		});
	}
};
