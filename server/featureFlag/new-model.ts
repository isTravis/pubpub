import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	Index,
	HasMany,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { FeatureFlagUser, FeatureFlagCommunity } from '../models';

@Table
export class FeatureFlag extends Model<
	InferAttributes<FeatureFlag>,
	InferCreationAttributes<FeatureFlag>
> {
	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@Index({ unique: true })
	@Column(DataType.STRING)
	name?: string | null;

	@Default(0)
	@Column(DataType.DOUBLE)
	enabledUsersFraction?: CreationOptional<number | null>;

	@Default(0)
	@Column(DataType.DOUBLE)
	enabledCommunitiesFraction?: CreationOptional<number | null>;

	@HasMany(() => FeatureFlagUser, {
		onDelete: 'CASCADE',
		as: 'users',
		foreignKey: 'featureFlagId',
	})
	users?: FeatureFlagUser[];

	@HasMany(() => FeatureFlagCommunity, {
		onDelete: 'CASCADE',
		as: 'communities',
		foreignKey: 'featureFlagId',
	})
	communities?: FeatureFlagCommunity[];
}
