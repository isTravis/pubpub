import { InsertableActivityItem, MemberActivityItem } from 'types';

import { ActivityRenderContext, Title, TitleRenderer } from '../types';
import { getUserFromContext } from './util';

const getUserTitleFromUserIdAndContext = (
	userId: null | string,
	context: ActivityRenderContext,
): Title => {
	if (userId) {
		if (userId === context.userId) {
			return { title: 'you' };
		}
		const userFromContext = getUserFromContext(userId, context);
		if (userFromContext) {
			return {
				title: userFromContext.fullName,
				href: `/user/${userFromContext.slug}`,
			};
		}
	}
	return {
		title: 'unknown user',
	};
};

export const titleActor: TitleRenderer<InsertableActivityItem> = (item, context) => {
	return getUserTitleFromUserIdAndContext(item.actorId, context);
};

export const titleMember: TitleRenderer<MemberActivityItem> = (item, context) => {
	return getUserTitleFromUserIdAndContext(item.payload.userId, context);
};
