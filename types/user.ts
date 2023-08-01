import { User as UserModel } from 'server/models';
import { SerializedModel } from './recursiveAttributes';

type UserType = SerializedModel<UserModel>;

export type MinimalUser = Pick<
	UserType,
	| 'id'
	| 'slug'
	| 'initials'
	| 'fullName'
	| 'firstName'
	| 'lastName'
	| 'avatar'
	| 'title'
	| 'orcid'
	| 'isShadowUser'
	| 'publicEmail'
	| 'feedback'
>;

export type User = Pick<
	UserType,
	| 'bio'
	| 'location'
	| 'website'
	| 'facebook'
	| 'twitter'
	| 'github'
	| 'googleScholar'
	| 'authRedirectHost'
	| keyof MinimalUser
>;
export type UserWithPrivateFields = Pick<
	UserType,
	| keyof User
	| 'isSuperAdmin'
	| 'passwordDigest'
	| 'hash'
	| 'salt'
	| 'email'
	| 'resetHash'
	| 'resetHashExpiration'
>;

export type UserWithPrivateFieldsAndHashedPassword = Pick<
	UserType,
	keyof UserWithPrivateFields | 'sha3hashedPassword'
>;

export type SuggestedEditsUser = Pick<MinimalUser, 'avatar' | 'initials' | 'fullName'>;
