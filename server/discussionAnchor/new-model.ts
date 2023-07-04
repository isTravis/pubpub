import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
	Index,
	Validate,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

@Table
export class DiscussionAnchor extends Model<
	InferAttributes<DiscussionAnchor>,
	InferCreationAttributes<DiscussionAnchor>
> {
	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@AllowNull(false)
	@Column(DataType.BOOLEAN)
	isOriginal!: boolean;

	@Index({ using: 'BTREE' })
	@AllowNull(false)
	@Column(DataType.UUID)
	discussionId!: string;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	historyKey!: number;

	@Column(DataType.JSONB)
	selection?: {
		head: number;
		type: 'text';
		anchor: number;
	} | null;

	@AllowNull(false)
	@Column(DataType.TEXT)
	originalText!: string;

	@AllowNull(false)
	@Column(DataType.TEXT)
	originalTextPrefix!: string;

	@AllowNull(false)
	@Column(DataType.TEXT)
	originalTextSuffix!: string;
}
