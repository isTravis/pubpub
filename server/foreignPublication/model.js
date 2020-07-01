export default (sequelize, dataTypes) => {
	return sequelize.define('ForeignPublication', {
		title: { type: dataTypes.TEXT, allowNull: false },
		url: { type: dataTypes.TEXT, allowNull: false },
		byline: { type: dataTypes.TEXT },
		doi: { type: dataTypes.TEXT },
		description: { type: dataTypes.TEXT },
		avatar: { type: dataTypes.TEXT },
		publicationDate: { type: dataTypes.DATE },
	});
};
