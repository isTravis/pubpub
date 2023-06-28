import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
	Index,
	BelongsTo,
	HasMany,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Thread, Visibility, User, Pub, Reviewer } from '../models';

@Table
export class ReviewNew extends Model<
	InferAttributes<ReviewNew>,
	InferCreationAttributes<ReviewNew>
> {
	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@Column(DataType.TEXT)
	title?: string | null;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	number!: number;

	@Default('open')
	@Column(DataType.ENUM('open', 'closed', 'completed'))
	status?: CreationOptional<string | null>;

	@Column(DataType.BOOLEAN)
	releaseRequested?: boolean | null;

	@Column(DataType.JSONB)
	labels?: object | null;

	@AllowNull(false)
	@Column(DataType.UUID)
	threadId!: string;

	@AllowNull(false)
	@Column(DataType.UUID)
	visibilityId!: string;

	@Index({ using: 'BTREE' })
	@Column(DataType.UUID)
	userId?: string | null;

	@Index({ using: 'BTREE' })
	@Column(DataType.UUID)
	pubId?: string | null;

	@Column(DataType.JSONB)
	reviewContent?: object | null;

	@BelongsTo(() => Thread, { onDelete: 'CASCADE', as: 'thread', foreignKey: 'threadId' })
	thread?: Thread;

	@BelongsTo(() => Visibility, {
		onDelete: 'CASCADE',
		as: 'visibility',
		foreignKey: 'visibilityId',
	})
	visibility?: Visibility;

	@BelongsTo(() => User, {
		onDelete: 'CASCADE',
		as: 'author',
		foreignKey: 'userId',
		constraints: false,
	})
	author?: User;

	@BelongsTo(() => Pub, { onDelete: 'CASCADE', as: 'pub', foreignKey: 'pubId' })
	pub?: Pub;

	@HasMany(() => Reviewer, { onDelete: 'CASCADE', as: 'reviewers', foreignKey: 'reviewId' })
	reviewers?: Reviewer[];
}
