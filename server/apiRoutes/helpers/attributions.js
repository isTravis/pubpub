/**
 * Helper functions for interacting with attribution models
 * (e.g. PubAttribution, CollectionAttribution)
 */
import { User } from '../../models';

const CAN_UPDATE_ATTRIBUTES = ['name', 'avatar', 'title', 'order', 'isAuthor', 'roles'];

const INCLUDE_USER_ATTRIBUTES = {
	model: User,
	as: 'user',
	required: false,
	attributes: ['id', 'firstName', 'lastName', 'fullName', 'avatar', 'slug', 'initials', 'title'],
};

const addFallbackUser = (attribution) => {
	if (attribution.user) {
		return attribution;
	}
	return {
		...attribution,
		user: {
			id: attribution.id,
			initials: attribution.name[0],
			fullName: attribution.name,
			firstName: attribution.name.split(' ')[0],
			lastName: attribution.name
				.split(' ')
				.slice(1, attribution.name.split(' ').length)
				.join(' '),
			avatar: attribution.avatar,
			title: attribution.title,
		},
	};
};

export default (AttributionModel, testPermissions) => (permissionsInput) =>
	testPermissions(permissionsInput).then(() => ({
		createAttribution: (attribution) =>
			AttributionModel.create(attribution)
				.then((newAttribution) =>
					AttributionModel.findOne({
						where: { id: newAttribution.id },
						attributes: { exclude: ['updatedAt'] },
						include: [INCLUDE_USER_ATTRIBUTES],
					}),
				)
				.then((newModelWithUser) => addFallbackUser(newModelWithUser.toJSON())),
		updateAttribution: (modelId, requestToUpdate) => {
			const updatedAttribution = {};
			Object.keys(requestToUpdate).forEach((key) => {
				if (CAN_UPDATE_ATTRIBUTES.includes(key)) {
					updatedAttribution[key] = requestToUpdate[key];
				}
			});
			return AttributionModel.update(updatedAttribution, { where: { id: modelId } });
		},
		destroyAttribution: (modelId) => AttributionModel.destroy({ where: { id: modelId } }),
	}));
