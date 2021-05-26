import { PubDiscussionCommentAddedActivityItem } from 'types';
import { pubUrl } from 'utils/canonicalUrls';

import { TitleRenderer } from '../types';
import { getPubFromContext } from './util';

export const titleDiscussion: TitleRenderer<PubDiscussionCommentAddedActivityItem> = (
	item,
	context,
) => {
	const pubFromContext = getPubFromContext(item.pubId, context);

	const title = item.payload.isReply ? 'a reply to a Discussion' : 'a new Discussion';
	const href = pubFromContext
		? pubUrl(null, pubFromContext, { hash: `discussion-${item.payload.discussionId}` })
		: null;

	return { title, href };
};
