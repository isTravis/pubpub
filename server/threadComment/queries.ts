import { ThreadComment, includeUserModel, Commenter } from 'server/models';
import * as types from 'types';
import { createCommenter } from '../commenter/queries';

const findThreadCommentWithUser = (
	id: string,
): Promise<types.DefinitelyHas<types.ThreadComment, 'author' | 'commenter'>> =>
	ThreadComment.findOne({
		where: { id },
		include: [includeUserModel({ as: 'author' }), { model: Commenter, as: 'commenter' }],
	});

export type CreateThreadWithCommentOptions = {
	text: string;
	content: types.DocJson;
	userId: null | string;
	commenterName: null | string;
};

export const createThreadCommentWithUserOrCommenter = async (
	options: CreateThreadWithCommentOptions,
	threadId: string,
) => {
	const { text, content, userId, commenterName } = options;
	const newCommenter = commenterName && (await createCommenter({ name: commenterName }));
	const userIdOrCommenterId = newCommenter ? { commenterId: newCommenter.id } : { userId };
	const commenter = newCommenter && 'id' in newCommenter ? newCommenter : null;
	const threadComment = await ThreadComment.create({
		text,
		content,
		threadId,
		...userIdOrCommenterId,
	});

	return { threadCommentId: threadComment.id, commenterId: commenter?.id };
};

export type CreateThreadCommentOptions = {
	text: string;
	content: types.DocJson;
	threadId: string;
	commenterName?: null | string;
	userId?: null | string;
};

export const createThreadComment = async (options: CreateThreadCommentOptions) => {
	const { text, content, commenterName, threadId, userId } = options;

	const user = userId || null;
	const commenter = commenterName || null;

	const { threadCommentId } = await createThreadCommentWithUserOrCommenter(
		{ text, content, userId: user, commenterName: commenter },
		threadId,
	);

	return findThreadCommentWithUser(threadCommentId);
};

export const updateThreadComment = (inputValues, updatePermissions) => {
	// Filter to only allow certain fields to be updated
	const filteredValues = {};
	Object.keys(inputValues).forEach((key) => {
		if (updatePermissions.includes(key)) {
			filteredValues[key] = inputValues[key];
		}
	});
	return ThreadComment.update(filteredValues, {
		where: { id: inputValues.threadCommentId },
	}).then(() => {
		return {
			...filteredValues,
			id: inputValues.threadCommentId,
		};
	});
};
