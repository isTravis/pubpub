import { FacetDefinition, FacetInstance } from './facet';

export function createEmptyFacetInstance<
	Definition extends FacetDefinition,
	Type = FacetInstance<Definition>,
>(definition: Definition): Type {
	const { props } = definition;
	const emptyFacet: Partial<Type> = {};
	Object.entries(props).forEach(([key, prop]) => {
		const value = prop.defaultValue ?? null;
		emptyFacet[key as keyof Type] = value;
	});
	return emptyFacet as Type;
}

export function createFacetInstance<Definition extends FacetDefinition>(
	definition: Definition,
	args: Partial<FacetInstance<Definition>> = {},
): FacetInstance<Definition> {
	return {
		...createEmptyFacetInstance(definition),
		...args,
	};
}
