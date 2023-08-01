import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { RecursiveAttributes } from 'types';

@Table
export class ExternalPublication extends Model<
	InferAttributes<ExternalPublication>,
	InferCreationAttributes<ExternalPublication>
> {
	public declare toJSON: <M extends Model>(this: M) => RecursiveAttributes<M>;

	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@AllowNull(false)
	@Column(DataType.TEXT)
	title!: string;

	@AllowNull(false)
	@Column(DataType.TEXT)
	url!: string;

	// TODO: add validation for contributors
	@Column(DataType.JSONB)
	contributors!: string[] | null;

	@Column(DataType.TEXT)
	doi!: string | null;

	@Column(DataType.TEXT)
	description!: string | null;

	@Column(DataType.TEXT)
	avatar!: string | null;

	@Column(DataType.DATE)
	publicationDate!: string | null;
}
