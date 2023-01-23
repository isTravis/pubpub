export default (sequelize, dataTypes) => {
	return sequelize.define(
		'collectionAttribution',
		{
			id: sequelize.idType,
			name: dataTypes.TEXT /* Used for non-account attribution */,
			avatar: dataTypes.TEXT /* Used for non-account attribution */,
			title: dataTypes.TEXT /* Used for non-account attribution */,
			order: dataTypes.DOUBLE,
			isAuthor: dataTypes.BOOLEAN,
			roles: dataTypes.JSONB,
			affiliation: dataTypes.TEXT,
			orcid: dataTypes.STRING,
		},
		{
			tableName: 'CollectionAttributions',
			classMethods: {
				associate: (models) => {
					const { collectionAttribution } = models;
					collectionAttribution.belongsTo(models.user, {
						foreignKey: { allowNull: false },
						onDelete: 'CASCADE',
					});
					collectionAttribution.belongsTo(models.collection, {
						onDelete: 'CASCADE',
					});
				},
			},
		},
	);
};
