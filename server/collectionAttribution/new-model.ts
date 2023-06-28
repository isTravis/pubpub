import { Model, Table, Column, DataType, PrimaryKey, Default, AllowNull, BelongsTo } from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { User, Collection } from '../models';

@Table
export class CollectionAttribution extends Model<InferAttributes<CollectionAttribution>, InferCreationAttributes<CollectionAttribution>> {

	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@Column(DataType.TEXT)
	name?: string | null;

	@Column(DataType.TEXT)
	avatar?: string | null;

	@Column(DataType.TEXT)
	title?: string | null;

	@Column(DataType.DOUBLE)
	order?: number | null;

	@Column(DataType.BOOLEAN)
	isAuthor?: boolean | null;

	@Column(DataType.JSONB)
	roles?: object | null;

	@Column(DataType.TEXT)
	affiliation?: string | null;

	@Column(DataType.STRING)
	orcid?: string | null;

	@Column(DataType.UUID)
	userId?: string | null;

	@AllowNull(false)
	@Column(DataType.UUID)
	collectionId!: string;



	@BelongsTo(() => User, {"onDelete":"CASCADE","as":"user","foreignKey":"userId"})
	user?: User;

	@BelongsTo(() => Collection, {"onDelete":"CASCADE","as":"collection","foreignKey":"collectionId"})
	collection?: Collection;
}