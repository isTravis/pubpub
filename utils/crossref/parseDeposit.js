const doiDataPaths = [
	['book', 'content_item'],
	['conference', 'conference_paper'],
	['journal', 'journal_article'],
	['posted_content'],
	['peer_review'],
	['sa_component', 'component_list', 'component'],
];

export const getDoiData = ({ doi_batch: { body } }) => {
	let i = 0;

	while (i < doiDataPaths.length) {
		const path = doiDataPaths[i];
		let visiting = body;
		let j = 0;

		while (j < path.length) {
			const key = path[j];
			visiting = visiting[key];

			if (!visiting) {
				break;
			}

			if (j === path.length - 1) {
				return visiting.doi_data;
			}

			j++;
		}

		i++;
	}

	return null;
};

export const getDepositRecordContentVersion = (depositRecord) => {
	if (!depositRecord) {
		return null;
	}

	const {
		depositJson: { deposit },
	} = depositRecord;
	const doiData = getDoiData(deposit);

	if (!doiData) {
		return null;
	}

	return doiData.resource['@content_version'];
};

export const setDepositRecordContentVersion = (depositRecord, contentVersion) => {
	const {
		depositJson: { deposit },
	} = depositRecord;
	const doiData = getDoiData(deposit);

	if (!contentVersion) {
		delete doiData.resource['@content_version'];
	} else {
		doiData.resource['@content_version'] = contentVersion;
	}
};

export const getDepositRecordReviewType = (depositRecord) => {
	if (!depositRecord) {
		return null;
	}

	const {
		depositJson: {
			deposit: {
				doi_batch: { body },
			},
		},
	} = depositRecord;

	if (!('peer_review' in body)) {
		return null;
	}

	return body.peer_review['@type'];
};

export const setDepositRecordReviewType = (depositRecord, reviewType) => {
	if (!depositRecord) {
		return null;
	}

	depositRecord.depositJson.deposit.doi_batch.body.peer_review['@type'] = reviewType;
};

export const getDepositRecordReviewRecommendation = (depositRecord) => {
	if (!depositRecord) {
		return null;
	}

	const {
		depositJson: {
			deposit: {
				doi_batch: { body },
			},
		},
	} = depositRecord;

	if (!('peer_review' in body)) {
		return null;
	}

	return body.peer_review['@recommendation'];
};

export const setDepositRecordReviewRecommendation = (depositRecord, recommendation) => {
	if (!depositRecord) {
		return null;
	}

	depositRecord.depositJson.deposit.doi_batch.body.peer_review[
		'@recommendation'
	] = recommendation;
};

export const getDepositBody = (crossrefDepositRecord) =>
	crossrefDepositRecord.depositJson.deposit.doi_batch.body;

const createIsDeposit = (key) => (crossrefDepositRecord) =>
	crossrefDepositRecord && key in getDepositBody(crossrefDepositRecord);

export const isBookDeposit = createIsDeposit('book');
export const isJournalDeposit = createIsDeposit('journal');
export const isConferenceDeposit = createIsDeposit('conference');
export const isPreprintDeposit = createIsDeposit('posted_content');
export const isPeerReviewDeposit = createIsDeposit('peer_review');
export const isStandaloneComponentDeposit = createIsDeposit('sa_component');

export const getDepositTypeTitle = (crossrefDepositRecord) => {
	if (isBookDeposit(crossrefDepositRecord)) return 'Book Chapter';
	if (isJournalDeposit(crossrefDepositRecord)) return 'Journal Article';
	if (isConferenceDeposit(crossrefDepositRecord)) return 'Conference Proceeding';
	if (isPreprintDeposit(crossrefDepositRecord)) return 'Preprint';
	if (isPeerReviewDeposit(crossrefDepositRecord)) return 'Peer Review';
	if (isStandaloneComponentDeposit(crossrefDepositRecord)) return 'Supplement';
	return '';
};
