import ensureUserForAttribution from 'utils/ensureUserForAttribution';
import { CollectionAttribution, includeUserModel } from 'server/models';
import { expect } from 'utils/assert';
import { CollectionAttributionCreationParams, UpdateParams } from 'types';

export const createCollectionAttribution = async (
	inputValues: CollectionAttributionCreationParams,
) => {
	const newAttribution = await CollectionAttribution.create({
		userId: inputValues.userId,
		collectionId: inputValues.collectionId,
		name: inputValues.name,
		order: inputValues.order,
	});
	const populatedCollectionAttribution = expect(
		await CollectionAttribution.findOne({
			where: { id: newAttribution.id },
			attributes: { exclude: ['updatedAt'] },
			include: [includeUserModel({ required: false, as: 'user' })],
		}),
	);

	const populatedCollectionAttributionJson = populatedCollectionAttribution.toJSON();

	if (populatedCollectionAttribution.user) {
		return populatedCollectionAttributionJson;
	}
	return ensureUserForAttribution(populatedCollectionAttributionJson);
};

export const updateCollectionAttribution = (
	inputValues: UpdateParams<CollectionAttribution> & { collectionAttributionId: string },
	updatePermissions,
) => {
	// Filter to only allow certain fields to be updated
	const filteredValues = {};
	Object.keys(inputValues).forEach((key) => {
		if (updatePermissions.includes(key)) {
			filteredValues[key] = inputValues[key];
		}
	});

	return CollectionAttribution.update(filteredValues, {
		where: { id: inputValues.collectionAttributionId },
	}).then(() => {
		return filteredValues;
	});
};

export const destroyCollectionAttribution = (inputValues: { collectionAttributionId: string }) => {
	return CollectionAttribution.destroy({
		where: { id: inputValues.collectionAttributionId },
	});
};
