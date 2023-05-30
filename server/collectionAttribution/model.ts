import { DataTypes as dataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

export const CollectionAttribution = sequelize.define(
	'CollectionAttribution',
	{
		id: sequelize.idType,
		name: { type: dataTypes.TEXT } /* Used for non-account attribution */,
		avatar: { type: dataTypes.TEXT } /* Used for non-account attribution */,
		title: { type: dataTypes.TEXT } /* Used for non-account attribution */,
		order: { type: dataTypes.DOUBLE },
		isAuthor: { type: dataTypes.BOOLEAN },
		roles: { type: dataTypes.JSONB },
		affiliation: { type: dataTypes.TEXT },
		orcid: { type: dataTypes.STRING },
		/* Set by Associations */
		userId: { type: dataTypes.UUID },
		collectionId: { type: dataTypes.UUID, allowNull: false },
	},
	{
		// @ts-expect-error ts(2345): Argument of type '{ classMethods: { associate: (models: any) => void; }; }' is not assignable to parameter of type 'ModelOptions<Model<any, any>>'. Object literal may only specify known properties, and 'classMethods' does not exist in type 'ModelOptions<Model<any, any>>'.
		classMethods: {
			associate: (models) => {
				const { Collection, CollectionAttribution, User } = models;
				CollectionAttribution.belongsTo(User, {
					onDelete: 'CASCADE',
					as: 'user',
					foreignKey: 'userId',
				});
				CollectionAttribution.belongsTo(Collection, {
					onDelete: 'CASCADE',
					as: 'collection',
					foreignKey: 'collectionId',
				});
			},
		},
	},
) as any;
