import {
	Model,
	Table,
	Column,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
	BelongsTo,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { WorkerTask } from '../models';

@Table
export class Export extends Model<InferAttributes<Export>, InferCreationAttributes<Export>> {
	// this overrides the default Date type to be compatible with existing code
	declare createdAt: CreationOptional<string>;
	declare updatedAt: CreationOptional<string>;

	@Default(DataType.UUIDV4)
	@PrimaryKey
	@Column(DataType.UUID)
	id!: CreationOptional<string>;

	@AllowNull(false)
	@Column(DataType.STRING)
	format!: string;

	@Column(DataType.STRING)
	url!: string | null;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	historyKey!: number;

	@AllowNull(false)
	@Column(DataType.UUID)
	pubId!: string;

	@Column(DataType.UUID)
	workerTaskId!: string | null;

	@BelongsTo(() => WorkerTask, {
		onDelete: 'SET NULL',
		as: 'workerTask',
		foreignKey: 'workerTaskId',
	})
	workerTask?: WorkerTask;
}
