import { Community as CommunityModel } from 'server/models';
import { SerializedModel } from './recursiveAttributes';

export type CommunityHeroButton = {
	title: string;
	url: string;
};

export type CommunityHeaderLink = { title: string; url: string; external?: boolean };

export type Community = SerializedModel<CommunityModel>;
