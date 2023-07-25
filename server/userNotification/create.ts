import { Op } from 'sequelize';

import * as types from 'types';
import {
	UserNotification,
	UserSubscription,
	UserNotificationPreferences,
	ActivityItem,
} from 'server/models';
import { indexByProperty, splitArrayOn } from 'utils/arrays';
import { filterUsersWhoCanSeeThread } from 'server/thread/queries';
import { expect } from 'utils/assert';

type ActivityItemResponder<Kind extends types.ActivityItemKind> = (
	item: types.ActivityItemOfKind<Kind>,
) => Promise<void>;

const createNotificationsForThreadComment = async (
	item: types.ActivityItemOfKind<'pub-discussion-comment-added' | 'pub-review-comment-added'>,
	includePubLevelSubscribers: boolean,
) => {
	const { actorId, pubId } = item;

	const threadId = expect(item.payload?.threadId);

	const subscriptionWhereQueries = includePubLevelSubscribers
		? [{ pubId }, { threadId }]
		: [{ threadId }];

	const subscriptions = await UserSubscription.findAll({
		where: {
			[Op.or]: subscriptionWhereQueries,
			userId: { [Op.not]: expect(actorId) },
			status: { [Op.not]: 'inactive' },
		},
	});

	const notificationPreferencesOptingOutOfNotifications =
		await UserNotificationPreferences.findAll({
			where: {
				userId: { [Op.in]: [...new Set(subscriptions.map((s) => s.userId))] },
				receiveNotifications: false,
			},
		});

	const userIdsWhoDoNotWantNotifications = notificationPreferencesOptingOutOfNotifications.map(
		(pref) => pref.userId,
	);

	const [mutedThreadSubscriptions, unmutedThreadSubscriptions] = splitArrayOn(
		subscriptions.filter((sub) => !!sub.threadId),
		(s) => s.status === 'muted',
	);

	const unmutedPubSubscriptionsNotSupersededByThreadMute = subscriptions.filter(
		(sub) =>
			sub.pubId &&
			sub.status !== 'muted' &&
			!mutedThreadSubscriptions.some((mutedSub) => mutedSub.userId === sub.userId),
	);

	const subscriptionsThatMayProduceNotifications = [
		...unmutedThreadSubscriptions,
		...unmutedPubSubscriptionsNotSupersededByThreadMute,
	];

	const subscriptionsByUserId = indexByProperty(
		subscriptionsThatMayProduceNotifications,
		'userId',
	);

	const userIdsToNotify = await filterUsersWhoCanSeeThread({
		threadId,
		userIds: subscriptionsThatMayProduceNotifications
			.map((sub) => sub.userId)
			.filter((userId) => !userIdsWhoDoNotWantNotifications.includes(userId)),
	});

	await UserNotification.bulkCreate(
		userIdsToNotify.map((userId) => {
			return {
				userId,
				userSubscriptionId: subscriptionsByUserId[userId].id,
				activityItemId: item.id,
			};
		}),
	);
};

const notificationCreatorsByKind = {
	'pub-discussion-comment-added': (item) => createNotificationsForThreadComment(item, true),
	'pub-review-comment-added': (item) => createNotificationsForThreadComment(item, false),
} satisfies Partial<{
	[Kind in types.ActivityItemKind]: ActivityItemResponder<Kind>;
}>;

export const createNotificationsForActivityItem = async <A extends ActivityItem>(item: A) => {
	if (item.kind in notificationCreatorsByKind) {
		const creator = notificationCreatorsByKind[item.kind];
		if (creator) {
			await creator(item);
		}
	}
};
