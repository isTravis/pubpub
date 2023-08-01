import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
	ForeignKey,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { RecursiveAttributes } from 'types';
import { User, Visibility } from '../models';

@Table
export class VisibilityUser extends Model<
	InferAttributes<VisibilityUser>,
	InferCreationAttributes<VisibilityUser>
> {
	public declare toJSON: <M extends Model>(this: M) => RecursiveAttributes<M>;

	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@AllowNull(false)
	@ForeignKey(() => User)
	@Column(DataType.UUID)
	userId!: string;

	@AllowNull(false)
	@ForeignKey(() => Visibility)
	@Column(DataType.UUID)
	visibilityId!: string;
}
