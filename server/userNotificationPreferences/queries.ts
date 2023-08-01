import * as types from 'types';
import { UserNotificationPreferences } from 'server/models';
import { pickKeys } from 'utils/objects';

const updatableFields = [
	'receiveNotifications',
	'receiveDiscussionThreadEmails',
	'subscribeToThreadsAsCommenter',
	'subscribeToPubsAsMember',
	'subscribeToPubsAsContributor',
	'notificationCadence',
	'markReadTrigger',
	'lastReceivedNotificationsAt',
] as const;

type UpdateOptions = {
	userId: string;
	preferences: Partial<types.UserNotificationPreferences>;
};

export const getOrCreateUserNotificationPreferences = async (userId: string) => {
	const found = await UserNotificationPreferences.findOne({ where: { userId } });
	if (found) {
		return found;
	}
	return UserNotificationPreferences.create({ userId });
};

export const updateUserNotificationPreferences = async (options: UpdateOptions) => {
	const { userId, preferences: unfilteredUpdate } = options;
	const update = pickKeys(unfilteredUpdate, updatableFields);
	await UserNotificationPreferences.update(update, { where: { userId } });
};
