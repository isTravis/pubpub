import { Collection, Community, Page } from '../../models';

export default (locationData, whereQuery) => {
	return Community.findOne({
		where: whereQuery,
		include: [
			{
				model: Page,
				as: 'pages',
				separate: true,
				attributes: {
					exclude: ['updatedAt', 'communityId'],
				},
			},
			{
				model: Collection,
				as: 'collections',
				separate: true,
			},
		],
	}).then((communityResult) => {
		if (!communityResult) {
			throw new Error('Community Not Found');
		}
		return communityResult.toJSON();
	});
};
