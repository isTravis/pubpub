import {
	FacetProp,
	CascadedTypeOfFacetProp,
	NullableTypeOfFacetProp,
	TypeOfFacetProp,
} from './prop';
import { FacetPropType } from './propType';

export type FacetProps = Record<string, FacetProp<FacetPropType, any>>;

type FacetPropsDefinitionTypeOf<Props extends FacetProps, FallbackValue = never> = {
	[K in keyof Props]: FallbackValue | CascadedTypeOfFacetProp<Props[K]>;
};

export type FacetSourceScope =
	| { kind: 'community' | 'collection' | 'pub'; id: string }
	| { kind: 'root'; id?: null };

export type WithFacetSource<T> = {
	scope: FacetSourceScope;
	facetBindingId: null | string;
	value: T;
};

export type FacetOptions<Name extends string, Props extends FacetProps> = {
	name: Name;
	props: Props;
	label?: string;
};

export type FacetDefinition<
	Name extends string = string,
	Props extends FacetProps = FacetProps,
> = FacetOptions<Name, Props> & {
	__facet: true;
};

export type CascadedFacetType<Def extends FacetDefinition> = FacetPropsDefinitionTypeOf<
	Def['props'],
	never
>;

export type FacetInstanceType<Def extends FacetDefinition> = FacetPropsDefinitionTypeOf<
	Def['props'],
	null
>;

export type FacetInstanceStack<Def extends FacetDefinition> = WithFacetSource<
	FacetInstanceType<Def>
>[];

export type PropCascadeContribution<Prop extends FacetProp> = {
	overwrite: NullableTypeOfFacetProp<Prop>;
	extend: TypeOfFacetProp<Prop> & any[];
	merge: Partial<TypeOfFacetProp<Prop>>;
}[Prop['cascade']];

export type PropCascadeResult<Prop extends FacetProp> = {
	overwrite: CascadedTypeOfFacetProp<Prop>;
	extend: TypeOfFacetProp<Prop> & any[];
	merge: Partial<TypeOfFacetProp<Prop>>;
}[Prop['cascade']];

export type FacetPropCascadeResult<Prop extends FacetProp> = {
	value: PropCascadeResult<Prop>;
	sources: WithFacetSource<PropCascadeContribution<Prop>>[];
};

export type FacetCascadedType<Def extends FacetDefinition> = {
	[K in keyof Def['props']]: PropCascadeResult<Def['props'][K]>;
};

export type FacetCascadeResult<Def extends FacetDefinition> = {
	value: FacetCascadedType<Def>;
	props: { [K in keyof Def['props']]: FacetPropCascadeResult<Def['props'][K]> };
	stack: FacetInstanceStack<Def>;
};

export const facet = <Name extends string, Props extends FacetProps>(
	options: FacetOptions<Name, Props>,
): FacetDefinition<Name, Props> => {
	return { ...options, __facet: true };
};
