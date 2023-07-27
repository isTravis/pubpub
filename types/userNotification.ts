import { CascadedFacetsForScopes } from 'facets';
import {
	UserNotification as UserNotificationModel,
	UserNotificationPreferences as UserNotificationPreferencesModel,
} from 'server/models';
import { RecursiveAttributes } from './recursiveAttributes';
import { ActivityAssociations, ActivityItemOfKind } from './activity';
import { UserSubscription } from './userSubscription';

export type UserNotification = RecursiveAttributes<UserNotificationModel>;

export type UserNotificationWithActivityItemModel = UserNotificationModel & {
	activityItem:
		| ActivityItemOfKind<'pub-discussion-comment-added'>
		| ActivityItemOfKind<'pub-review-comment-added'>;
};

export type UserNotificationWithActivityItem = Omit<UserNotification, 'activityItem'> & {
	activityItem:
		| ActivityItemOfKind<'pub-discussion-comment-added'>
		| ActivityItemOfKind<'pub-review-comment-added'>;
};

export type UserNotificationMarkReadTrigger = 'seen' | 'clicked-through' | 'manual';

export type UserNotificationPreferences = RecursiveAttributes<UserNotificationPreferencesModel>;

export type UserNotificationsFetchResult = {
	notifications: UserNotificationWithActivityItem[];
	associations: ActivityAssociations;
	subscriptions: UserSubscription[];
	facets: CascadedFacetsForScopes<'PubHeaderTheme'>;
	notificationPreferences: UserNotificationPreferences;
};
