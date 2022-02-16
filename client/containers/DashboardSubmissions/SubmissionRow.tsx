import React, { useState } from 'react';

import {
	getSubmissionStatusLabel,
	getSubmissionTimeLabel,
	IconLabelPair,
} from '../DashboardOverview/overviewRows/labels';
import { PubOverviewRow } from '../DashboardOverview/overviewRows';
import { PubWithSubmission } from './types';
import ArbitrationMenu from './ArbitrationMenu';

type Props = {
	pub: PubWithSubmission;
};

const SubmissionRow = (props: Props) => {
	const { pub } = props;
	const [status, setStatus] = useState(pub.submission.status);
	const [isDeleted, setIsDeleted] = useState(false);

	const labels = [getSubmissionStatusLabel(status), getSubmissionTimeLabel(pub)].filter(
		(x): x is IconLabelPair => !!x,
	);

	if (isDeleted) {
		return null;
	}

	return (
		<PubOverviewRow
			pub={pub}
			leftIconElement="manually-entered-data"
			isGrayscale={status === 'declined'}
			labels={labels}
			rightElement={
				<ArbitrationMenu
					pub={pub}
					onJudgePub={setStatus}
					onDeletePub={() => setIsDeleted(true)}
				/>
			}
		/>
	);
};

export default SubmissionRow;
