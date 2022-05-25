export default (sequelize, dataTypes) => {
	return sequelize.define(
		'SubmissionWorkflow',
		{
			id: sequelize.idType,
			title: { type: dataTypes.TEXT, allowNull: false },
			collectionId: { type: dataTypes.UUID },
			enabled: { type: dataTypes.BOOLEAN, allowNull: false },
			instructionsText: { type: dataTypes.JSONB, allowNull: false },
			acceptedText: { type: dataTypes.JSONB, allowNull: false },
			declinedText: { type: dataTypes.JSONB, allowNull: false },
			receivedEmailText: { type: dataTypes.JSONB, allowNull: false },
			introText: { type: dataTypes.JSONB, allowNull: false },
			targetEmailAddresses: { type: dataTypes.JSONB, allowNull: false, defaultValue: [] },
			requireAbstract: { type: dataTypes.BOOLEAN, allowNull: false, defaultValue: false },
			requireDescription: { type: dataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		},
		{
			classMethods: {
				associate: (models) => {
					const { Collection, SubmissionWorkflow, Submission } = models;
					SubmissionWorkflow.hasMany(Submission, {
						as: 'submissions',
						foreignKey: 'submissionWorkflowId',
					});
					SubmissionWorkflow.belongsTo(Collection, {
						as: 'collection',
						foreignKey: 'collectionId',
					});
				},
			},
		},
	);
};
