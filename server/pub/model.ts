export default (sequelize, dataTypes) => {
	return sequelize.define(
		'Pub',
		{
			id: sequelize.idType,
			slug: {
				type: dataTypes.TEXT,
				unique: true,
				allowNull: false,
				validate: {
					isLowercase: true,
					len: [1, 280],
					is: /^[a-zA-Z0-9-]+$/, // Must contain at least one letter, alphanumeric and underscores and hyphens
				},
			},
			title: { type: dataTypes.TEXT, allowNull: false },
			htmlTitle: { type: dataTypes.TEXT, allowNull: true },
			description: {
				type: dataTypes.TEXT,
				validate: {
					len: [0, 280],
				},
			},
			avatar: { type: dataTypes.TEXT },
			headerStyle: {
				type: dataTypes.ENUM,
				values: ['white-blocks', 'black-blocks', 'dark', 'light'],
				defaultValue: null,
			},
			headerBackgroundColor: { type: dataTypes.STRING },
			headerBackgroundImage: { type: dataTypes.TEXT },
			firstPublishedAt: { type: dataTypes.DATE },
			lastPublishedAt: { type: dataTypes.DATE },
			customPublishedAt: { type: dataTypes.DATE },
			doi: { type: dataTypes.TEXT },
			labels: { type: dataTypes.JSONB },
			downloads: { type: dataTypes.JSONB },
			metadata: { type: dataTypes.JSONB },
			licenseSlug: { type: dataTypes.TEXT, defaultValue: 'cc-by' },
			citationStyle: { type: dataTypes.TEXT, defaultValue: 'apa-7' },
			citationInlineStyle: { type: dataTypes.TEXT, defaultValue: 'count' },
			viewHash: { type: dataTypes.STRING },
			editHash: { type: dataTypes.STRING },
			reviewSlug: { type: dataTypes.STRING },
			nodeLabels: { type: dataTypes.JSONB },

			pubEdgeListingDefaultsToCarousel: {
				type: dataTypes.BOOLEAN,
				defaultValue: true,
				allowNull: false,
			},
			pubEdgeDescriptionVisible: {
				type: dataTypes.BOOLEAN,
				defaultValue: true,
				allowNull: false,
			},

			/* Set by Associations */
			draftId: { type: dataTypes.UUID, allowNull: false },
			communityId: { type: dataTypes.UUID, allowNull: false },
		},
		{
			indexes: [{ fields: ['communityId'], method: 'BTREE' }],
			classMethods: {
				associate: (models) => {
					const {
						CollectionPub,
						Community,
						CrossrefDepositRecord,
						Discussion,
						Export,
						Member,
						Pub,
						PubAttribution,
						PubEdge,
						PubVersion,
						Release,
						ReviewNew,
						ScopeSummary,
						Submission,
					} = models;
					Pub.hasMany(PubAttribution, {
						onDelete: 'CASCADE',
						as: 'attributions',
						foreignKey: 'pubId',
					});
					Pub.hasMany(CollectionPub, {
						onDelete: 'CASCADE',
						hooks: true,
						as: 'collectionPubs',
						foreignKey: 'pubId',
					});
					Pub.belongsTo(Community, {
						onDelete: 'CASCADE',
						as: 'community',
						foreignKey: 'communityId',
					});
					Pub.hasMany(Discussion, {
						onDelete: 'CASCADE',
						as: 'discussions',
						foreignKey: 'pubId',
					});
					Pub.hasMany(Export, {
						as: 'exports',
						foreignKey: 'pubId',
					});
					Pub.hasMany(ReviewNew, {
						onDelete: 'CASCADE',
						as: 'reviews',
						foreignKey: 'pubId',
					});
					Pub.hasMany(Member, {
						onDelete: 'CASCADE',
						as: 'members',
						foreignKey: 'pubId',
					});
					Pub.hasMany(Release, {
						onDelete: 'CASCADE',
						as: 'releases',
						foreignKey: 'pubId',
					});
					Pub.hasMany(PubVersion, {
						onDelete: 'CASCADE',
						as: 'pubVersions',
						foreignKey: 'pubId',
					});
					Pub.hasMany(PubEdge, {
						onDelete: 'CASCADE',
						as: 'outboundEdges',
						foreignKey: 'pubId',
					});
					Pub.hasMany(PubEdge, {
						onDelete: 'CASCADE',
						as: 'inboundEdges',
						foreignKey: 'targetPubId',
					});
					Pub.hasOne(Submission, {
						as: 'submission',
						foreignKey: 'pubId',
					});
					Pub.belongsTo(CrossrefDepositRecord, {
						as: 'crossrefDepositRecord',
						foreignKey: 'crossrefDepositRecordId',
					});
					Pub.belongsTo(ScopeSummary, {
						as: 'scopeSummary',
						foreignKey: 'scopeSummaryId',
					});
				},
			},
		},
	);
};
