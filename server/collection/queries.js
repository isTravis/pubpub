import { Collection, CollectionPub, Community } from 'server/models';
import { normalizeMetadataToKind } from 'utils/collections/metadata';
import { slugifyString } from 'utils/strings';
import { generateHash } from 'utils/hashes';

export const generateDefaultCollectionLayout = (title) => {
	return {
		isNarrow: false,
		blocks: [
			{
				id: generateHash(8),
				type: 'text',
				content: {
					text: {
						type: 'doc',
						attrs: {
							meta: {},
						},
						content: [
							{
								type: 'heading',
								attrs: {
									level: 1,
								},
								content: [
									{
										text: title,
										type: 'text',
									},
								],
							},
						],
					},
					align: 'left',
				},
			},
			{
				type: 'pubs',
				id: generateHash(8),
				content: {
					sort: 'collection-rank',
					pubPreviewType: 'medium',
				},
			},
		],
	};
};

export const createCollection = ({
	communityId,
	title,
	kind,
	pageId = null,
	doi = null,
	isPublic = false,
	id = null,
	slug = null,
}) => {
	return Community.findOne({ where: { id: communityId } }).then((community) => {
		const normalizedTitle = title.trim();
		const collection = {
			title: normalizedTitle,
			slug: slug || slugifyString(title),
			isRestricted: true,
			isPublic: isPublic,
			viewHash: generateHash(8),
			editHash: generateHash(8),
			communityId: communityId,
			pageId: pageId,
			doi: doi,
			kind: kind,
			layout: generateDefaultCollectionLayout(normalizedTitle),
			...(id && { id: id }),
		};
		const metadata = normalizeMetadataToKind({}, kind, {
			community: community,
			collection: collection,
		});
		return Collection.create({ ...collection, metadata: metadata }, { returning: true });
	});
};

export const updateCollection = (inputValues, updatePermissions) => {
	// Filter to only allow certain fields to be updated
	const filteredValues = {};
	Object.keys(inputValues).forEach((key) => {
		if (updatePermissions.includes(key)) {
			filteredValues[key] = inputValues[key];
		}
	});

	return Collection.update(filteredValues, {
		where: { id: inputValues.collectionId },
	})
		.then(() => {
			if (filteredValues.isPublic === false) {
				return CollectionPub.update(
					{ isPrimary: false },
					{ where: { isPrimary: true, collectionId: inputValues.collectionId } },
				);
			}
			return null;
		})
		.then(() => {
			return filteredValues;
		});
};

export const destroyCollection = (inputValues) => {
	return Collection.destroy({
		where: { id: inputValues.collectionId },
	});
};
