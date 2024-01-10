import { Step } from 'prosemirror-transform';

import { DiscussionAnchor } from 'server/models';
import { DiscussionAnchor as DiscussionAnchorType } from 'types';
import {
	DiscussionSelection,
	mapDiscussionSelectionThroughSteps,
} from 'components/Editor/plugins/discussions';

/**
 * Persists a new anchor for an existing one based on changes to a Prosemirror document.
 *
 * @param anchor An anchor model that will be updated and stored with a later history key
 * @param steps Some steps to apply to the document to compute the new anchor position
 * @param historyKey The history key that (doc + steps) corresponds to
 * @param sequelizeTxn A Sequelize transaction with which to commit (or rollback) this item
 */
export const createUpdatedDiscussionAnchorForNewSteps = async (
	anchor: DiscussionAnchorType,
	steps: Step[],
	historyKey: number,
	sequelizeTxn: any = null,
) => {
	const { originalText, originalTextPrefix, originalTextSuffix, discussionId, selection } =
		anchor;
	const nextSelection = mapDiscussionSelectionThroughSteps(selection, steps);
	return DiscussionAnchor.create(
		{
			historyKey,
			discussionId,
			originalText,
			originalTextPrefix,
			originalTextSuffix,
			selection: nextSelection,
			isOriginal: false,
		},
		{ transaction: sequelizeTxn },
	);
};

export const createDiscussionAnchor = async ({
	discussionId,
	historyKey,
	selectionJson,
	originalText = '',
	originalTextPrefix = '',
	originalTextSuffix = '',
	isOriginal = true,
}: {
	discussionId: string;
	historyKey: number;
	selectionJson: DiscussionSelection;
	originalText: string;
	originalTextPrefix?: string;
	originalTextSuffix?: string;
	isOriginal?: boolean;
}) => {
	const { head, anchor } = selectionJson;
	return DiscussionAnchor.create({
		discussionId,
		historyKey,
		selection: head === anchor ? null : selectionJson,
		originalText,
		originalTextPrefix,
		originalTextSuffix,
		isOriginal,
	});
};
