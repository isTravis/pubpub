import * as types from 'types';
import { Community, LandingPageFeature, Pub } from 'server/models';
import { splitArrayOn } from 'utils/arrays';
import { buildPubOptions } from 'server/utils/queryHelpers';

const landingPageFeatureIncludes = [
	{ model: Pub, as: 'pub', ...buildPubOptions({ getCommunity: true, getCollections: true }) },
	{ model: Community, as: 'community' },
];

export const getLandingPageFeatures = async (): Promise<types.LandingPageFeatures> => {
	const features: types.LandingPageFeature[] = await LandingPageFeature.findAll({
		include: landingPageFeatureIncludes,
		order: [['rank', 'ASC']],
	});
	const [pubFeatures, communityFeatures] = splitArrayOn(features, (f) => !!f.pub);
	const sanitizedPubFeatures = pubFeatures.filter(
		(feature) => feature.pub?.releases?.length! > 0,
	);
	return {
		pub: sanitizedPubFeatures as types.LandingPagePubFeature[],
		community: communityFeatures as types.LandingPageCommunityFeature[],
	};
};

type CreateLandingPageFeatureOptions = {
	pubId?: string;
	communityId?: string;
	rank: string;
};

export const createLandingPageFeature = async (
	options: CreateLandingPageFeatureOptions,
): Promise<types.LandingPageFeature> => {
	const { pubId, communityId, rank } = options;
	const newFeature = await LandingPageFeature.create({ pubId, communityId, rank });
	return LandingPageFeature.findOne({
		where: { id: newFeature.id },
		include: landingPageFeatureIncludes,
	});
};

type UpdateLandingPageFeatureOptions = {
	id: string;
	rank: string;
};

export const updateLandingPageFeature = async (options: UpdateLandingPageFeatureOptions) => {
	const { id, rank } = options;
	await LandingPageFeature.update({ rank }, { where: { id }, limit: 1 });
};

type destroyLandingPageFeatureOptions = {
	id: string;
};

export const destroyLandingPageFeature = async (options: destroyLandingPageFeatureOptions) => {
	const { id } = options;
	return LandingPageFeature.destroy({ where: { id }, limit: 1 });
};
