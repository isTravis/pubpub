import { FacetsError, FacetSourceScope } from 'facets';
import * as types from 'types';

export type Scope = types.SingleScopeId;

export type BindingKey = 'communityId' | 'collectionId' | 'pubId';

export type ByScopeKind<T> = {
	community: T;
	collection: T;
	pub: T;
};

export type ScopeKind = keyof ByScopeKind<any>;

export const createByScopeKind = <T>(instantiate: () => T): ByScopeKind<T> => {
	return {
		pub: instantiate(),
		collection: instantiate(),
		community: instantiate(),
	};
};

export const mapByScopeKind = <From, To>(
	byScopeKind: ByScopeKind<From>,
	mapper: (from: From, kind: ScopeKind) => To,
): ByScopeKind<To> => {
	const { pub, collection, community } = byScopeKind;
	return {
		pub: mapper(pub, 'pub'),
		collection: mapper(collection, 'collection'),
		community: mapper(community, 'community'),
	};
};

export const getBindingKeyForScopeKind = (scopeKind: ScopeKind): BindingKey => {
	if (scopeKind === 'pub') {
		return 'pubId';
	}
	if (scopeKind === 'collection') {
		return 'collectionId';
	}
	return 'communityId';
};

export const getScopeKindForBindingKey = (key: BindingKey): ScopeKind => {
	if (key === 'pubId') {
		return 'pub';
	}
	if (key === 'collectionId') {
		return 'collection';
	}
	return 'pub';
};

export const getScopeKind = (scope: Scope): ScopeKind => {
	if ('pubId' in scope) {
		return 'pub';
	}
	if ('collectionId' in scope) {
		return 'collection';
	}
	return 'community';
};

export const getSourceScope = (scope: Scope): FacetSourceScope => {
	const kind = getScopeKind(scope);
	const bindingKey = getBindingKeyForScopeKind(kind);
	return { kind, id: scope[bindingKey] };
};

export const getScopeId = (sourceScope: FacetSourceScope): Scope => {
	const { kind, id } = sourceScope;
	if (kind !== 'root') {
		const key = getBindingKeyForScopeKind(kind);
		return { [key]: id } as Scope;
	}
	throw new FacetsError("Can't get scope id for root scope");
};
