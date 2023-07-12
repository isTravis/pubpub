import { Sequelize, DataTypes } from 'sequelize';
import { FacetBindingAnyModel as FacetBinding } from './models/facetBinding';

import { ALL_FACET_DEFINITIONS, FacetName, FacetProp, FacetProps } from '../../facets';

type Column = {
	type: (typeof DataTypes)[keyof typeof DataTypes];
	allowNull: true;
	defaultValue: any;
};

const getSequelizePropDefinition = (prop: FacetProp<any, any>): Column => {
	const {
		propType: { postgresType },
	} = prop;
	return {
		type: postgresType,
		allowNull: true,
		defaultValue: null,
	};
};

const getSequelizePropsDefinition = (props: FacetProps) => {
	const columns: Record<string, Column> = {};
	Object.entries(props).forEach(([name, prop]) => {
		columns[name] = getSequelizePropDefinition(prop);
	});
	return columns;
};

export const ingestFacets = (sequelize: Sequelize) => {
	const modelsByName: Record<string, any> = {};
	Object.values(ALL_FACET_DEFINITIONS).forEach((facet) => {
		const { name, props } = facet;
		const FacetModel = sequelize.define(
			name,
			{
				...getSequelizePropsDefinition(props),
				id: (sequelize as any).idType,
				facetBindingId: { type: DataTypes.UUID, allowNull: false },
			},
			{ tableName: name },
		) as any;
		FacetModel.belongsTo(FacetBinding, {
			foreignKey: 'facetBindingId',
			as: 'facetBinding',
			onDelete: 'CASCADE',
		});
		modelsByName[name] = FacetModel;
	});
	return {
		facetModels: modelsByName as Record<FacetName, any>,
		FacetBinding,
	};
};
