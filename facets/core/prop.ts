import { FacetPropType, NullableTypeOfPropType, TypeOfFacetPropType } from './propType';

type IsNeverNull<T> = Extract<T, null> extends never ? true : false;

export type AvailableCascadeStrategyForPropType<PropType extends FacetPropType> =
	// Any prop type can use the `overwrite` strategy
	| 'overwrite'
	// Only props that are objects can object-merge during cascade" {...a, ...b}
	| (TypeOfFacetPropType<PropType> extends Record<string, any> ? 'merge' : never)
	// Only props that are arrays can array-merge during cascasde: [...a, ...b]
	| (TypeOfFacetPropType<PropType> extends any[] ? 'extend' : never);

export type CascadeStrategy = 'overwrite' | 'merge' | 'extend';

export type FacetPropOptions<
	// The PropType of the prop.
	PropType extends FacetPropType,
	// The `rootValue` provided, which may be `null`.
	// We provide this as a type parameter so that TypeScript will infer its narrowest -- most
	// specific -- type and preserve that information in the inferred return type. This lets us
	// determine statically whether a facet prop will ever be null and adjust its TypeScript
	// definitions accordingly.
	RootValue extends NullableTypeOfPropType<PropType>,
	// When we provide a defaultValue to a facet, it may be `null`.
	DefaultValue = NullableTypeOfPropType<PropType>,
> = {
	// The value of this prop at the "root" of PubPub -- in the absence of any other facet instances
	// that override it, what value does this prop have?
	rootValue: RootValue;
	// The default value of this prop, if not explicitly provided to createFacet(). By contrast with
	// `rootValue`, this value will actually be stored on a facet instance.
	defaultValue?: DefaultValue;
	// Explains how this prop should cascade from higher to lower scopes.
	cascade?: AvailableCascadeStrategyForPropType<PropType>;
	// A human-readable label for this prop
	label?: string;
};

export type FacetProp<
	PropType extends FacetPropType = FacetPropType,
	RootValue extends NullableTypeOfPropType<PropType> = NullableTypeOfPropType<PropType>,
> =
	// Everything in the FacetPropOptions above...
	Omit<FacetPropOptions<PropType, RootValue>, 'cascade'> & {
		__facetProp: true;
		// Plus the provided propType.
		propType: PropType;
		// Plus a non-nullable cascade strategy with a default value applied.
		cascade: CascadeStrategy;
	};

export type RootValueOfFacetProp<Prop extends FacetProp> = Prop['rootValue'];
export type TypeOfFacetProp<Prop extends FacetProp> = TypeOfFacetPropType<Prop['propType']>;
export type NullableTypeOfFacetProp<Prop extends FacetProp> = NullableTypeOfPropType<
	Prop['propType']
>;

export type CascadedTypeOfFacetProp<Prop extends FacetProp> =
	// If the root value of the prop is non-null...
	IsNeverNull<RootValueOfFacetProp<Prop>> extends true
		? // ...then we'll never get null as a cascaded value for this prop
		  TypeOfFacetProp<Prop>
		: // Otherwise, we might.
		  NullableTypeOfFacetProp<Prop>;

// Creates a prop definition.
export const prop = <
	PropType extends FacetPropType,
	RootValue extends NullableTypeOfPropType<PropType>,
>(
	propType: PropType,
	options: FacetPropOptions<PropType, RootValue>,
): FacetProp<PropType, RootValue> => {
	const cascade: AvailableCascadeStrategyForPropType<PropType> = options.cascade ?? 'overwrite';
	return {
		...options,
		propType,
		cascade,
		__facetProp: true,
	};
};
