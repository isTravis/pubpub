import React from 'react';

import * as types from 'types';
import type { Community } from 'server/models';
import { communityUrl } from 'utils/canonicalUrls';

type Props = {
	community: types.Community | Community;
	customText: React.ReactNode;
	submissionTitle: string;
	collectionTitle: string;
	submissionUrl?: string;
	submitterName: React.ReactNode;
	kind: types.SubmissionEmailKind;
};

const SubmissionEmail = (props: Props) => {
	const {
		community,
		customText,
		submissionTitle,
		collectionTitle,
		submissionUrl,
		submitterName,
		kind,
	} = props;

	const communityLink = <a href={communityUrl(community)}>{community.title}</a>;

	const submissionLink = submissionUrl ? (
		<a href={submissionUrl}>{submissionTitle}</a>
	) : (
		<u>{submissionTitle}</u>
	);

	const submissionNounPhrase = (
		<>
			Your submission {submissionLink} to <i>{collectionTitle}</i> in {communityLink}
		</>
	);

	const renderBoilerplate = () => {
		if (kind === 'received') {
			return (
				<>
					{submissionNounPhrase} has been received. You may reply to this email thread to
					reach us.
				</>
			);
		}
		if (kind === 'accepted') {
			return <>{submissionNounPhrase} has been accepted.</>;
		}
		return <>{submissionNounPhrase} has been declined.</>;
	};

	return (
		<div>
			<p>Hello {submitterName},</p>
			<p>{renderBoilerplate()}</p>
			{customText}
		</div>
	);
};

export default SubmissionEmail;
