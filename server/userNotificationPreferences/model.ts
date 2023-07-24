import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	Index,
	AllowNull,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { UserNotificationMarkReadTrigger } from 'types';

@Table
export class UserNotificationPreferences extends Model<
	InferAttributes<UserNotificationPreferences>,
	InferCreationAttributes<UserNotificationPreferences>
> {
	// this overrides the default Date type to be compatible with existing code
	declare createdAt: CreationOptional<string>;
	declare updatedAt: CreationOptional<string>;

	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@Index({ using: 'BTREE' })
	@AllowNull(false)
	@Column(DataType.UUID)
	userId!: string;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	receiveNotifications!: CreationOptional<boolean>;

	@Column(DataType.DATE)
	lastReceivedNotificationsAt!: Date | null;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	subscribeToThreadsAsCommenter!: CreationOptional<boolean>;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	subscribeToPubsAsMember!: CreationOptional<boolean>;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	subscribeToPubsAsContributor!: CreationOptional<boolean>;

	@AllowNull(false)
	@Default(0)
	@Column(DataType.INTEGER)
	notificationCadence!: CreationOptional<number>;

	// TODO: Add validation for this, or make enum
	@AllowNull(false)
	@Default('clicked-through')
	@Column(DataType.STRING)
	markReadTrigger!: CreationOptional<UserNotificationMarkReadTrigger>;
}
