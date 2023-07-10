import { Model, Table, Column, DataType, PrimaryKey, Default, HasOne } from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { ZoteroIntegration } from '../models';

@Table({
	tableName: 'IntegrationDataOAuth1',
})
export class IntegrationDataOAuth1 extends Model<
	InferAttributes<IntegrationDataOAuth1>,
	InferCreationAttributes<IntegrationDataOAuth1>
> {
	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@Column(DataType.TEXT)
	accessToken?: string | null;

	@HasOne(() => ZoteroIntegration, {
		foreignKey: { allowNull: false, name: 'integrationDataOAuth1Id' },
		as: 'zoteroIntegration',
		onDelete: 'CASCADE',
	})
	zoteroIntegration?: ZoteroIntegration;
}
