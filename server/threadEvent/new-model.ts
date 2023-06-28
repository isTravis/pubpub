import { Model, Table, Column, DataType, PrimaryKey, Default, AllowNull, BelongsTo } from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { User } from '../models';

@Table
export class ThreadEvent extends Model<InferAttributes<ThreadEvent>, InferCreationAttributes<ThreadEvent>> {

	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@Column(DataType.STRING)
	type?: string | null;

	@Column(DataType.JSONB)
	data?: object | null;

	@AllowNull(false)
	@Column(DataType.UUID)
	userId!: string;

	@AllowNull(false)
	@Column(DataType.UUID)
	threadId!: string;



	@BelongsTo(() => User, {"onDelete":"CASCADE","as":"user","foreignKey":"userId"})
	user?: User;
}