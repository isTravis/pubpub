import { DataTypes as dataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

export const ReviewEvent = sequelize.define(
	'ReviewEvent',
	{
		id: sequelize.idType,
		type: { type: dataTypes.STRING },
		data: { type: dataTypes.JSONB },
		/* Set by Associations */
		userId: { type: dataTypes.UUID, allowNull: false },
		pubId: { type: dataTypes.UUID, allowNull: false },
		reviewId: { type: dataTypes.UUID, allowNull: false },
	},
	{
		// @ts-expect-error ts(2345): Argument of type '{ classMethods: { associate: (models: any) => void; }; }' is not assignable to parameter of type 'ModelOptions<Model<any, any>>'. Object literal may only specify known properties, and 'classMethods' does not exist in type 'ModelOptions<Model<any, any>>'.
		classMethods: {
			associate: (models) => {
				const { User, ReviewEvent } = models;
				ReviewEvent.belongsTo(User, {
					onDelete: 'CASCADE',
					as: 'user',
					foreignKey: 'userId',
				});
			},
		},
	},
) as any;
