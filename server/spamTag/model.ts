import { DataTypes as dataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

export const SpamTag = sequelize.define('SpamTag', {
	id: sequelize.idType,
	status: {
		type: dataTypes.STRING,
		defaultValue: 'unreviewed',
		allowNull: false,
	},
	statusUpdatedAt: {
		type: dataTypes.DATE,
		allowNull: true,
	},
	fields: {
		type: dataTypes.JSONB,
		allowNull: false,
	},
	spamScore: {
		type: dataTypes.DOUBLE,
		allowNull: false,
	},
	spamScoreComputedAt: {
		type: dataTypes.DATE,
		allowNull: false,
	},
	spamScoreVersion: {
		type: dataTypes.INTEGER,
		defaultValue: 1,
	},
}) as any;
