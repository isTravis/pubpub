/**
 * renderStatic() turns a list of ProseMirror nodes (in dehydrated JSON form) into a list of React
 * elements. This is useful for creating HTML from documents on the server side, since ProseMirror's
 * standard tools for doing this rely on the presence of a DOM API in the global scope.
 *
 * There are two steps to this process:
 *
 * 1. Convert Prosemirror nodes to the "output spec" format generated by Prosemirror toDOM methods.
 *    This is an HTML-equivalent representation made of nested arrays.
 * 	  (See here: https://prosemirror.net/docs/ref/version/0.18.0.html#model.DOMOutputSpec)
 * 2. Turn the output spec into React elements.
 */
import React from 'react';
import css from 'css';
import camelCaseCss from 'camelcase-css';
import { Node } from 'prosemirror-model';
import { getReactedDoc } from '@pubpub/prosemirror-reactive';

const parseStyleToObject = (style) => {
	try {
		const styleObj = {};
		const wrappedStyle = `* { ${style} } `;
		const cssAst = css.parse(wrappedStyle);
		const { declarations } = cssAst.stylesheet.rules[0];
		declarations.forEach(({ property, value }) => {
			const camelCaseProperty = camelCaseCss(property);
			styleObj[camelCaseProperty] = value;
		});
		return styleObj;
	} catch (_) {
		return {};
	}
};

const attrsTransformations = {
	rowspan: 'rowSpan',
	colspan: 'colSpan',
	class: 'className',
	spellcheck: 'spellCheck',
	style: (val) => {
		return { style: typeof val === 'string' ? parseStyleToObject(val) : val };
	},
};

const normalizeAttrsForReact = (attrs) => {
	let resAttrs = {};
	Object.entries(attrs).forEach(([key, value]) => {
		if (key in attrsTransformations) {
			const transformValue = attrsTransformations[key];
			if (typeof transformValue === 'function') {
				resAttrs = { ...resAttrs, ...transformValue(value) };
			} else {
				resAttrs[transformValue] = value;
			}
		} else {
			resAttrs[key] = value;
		}
	});
	return resAttrs;
};

const getAttrsFromOutputSpec = (maybeAttrs) => {
	const hasAttrs = maybeAttrs && typeof maybeAttrs === 'object' && !Array.isArray(maybeAttrs);
	const attrs = hasAttrs ? normalizeAttrsForReact(maybeAttrs) : {};
	return { attrs: attrs, hasAttrs: hasAttrs };
};

const createReactFromOutputSpec = (spec, key) => {
	if (!Array.isArray(spec)) {
		return spec;
	}
	const [tagName, maybeAttrs, ...restItems] = spec;
	const { attrs, hasAttrs } = getAttrsFromOutputSpec(maybeAttrs);
	const children = hasAttrs ? restItems : [maybeAttrs, ...restItems];
	return React.createElement(
		tagName,
		{ ...attrs, key: key },
		...children.map((child, index) => createReactFromOutputSpec(child, `${key}-${index}`)),
	);
};

const isHole = (child) => child === 0;

const fillHoleInSpec = (outputSpec, children, isMark) => {
	if (Array.isArray(outputSpec)) {
		const holeIndex = outputSpec.findIndex(isHole);
		if (holeIndex >= 0) {
			return [
				...outputSpec.slice(0, holeIndex),
				...children,
				...outputSpec.slice(holeIndex + 1),
			];
		}
		if (isMark) {
			return [...outputSpec, ...children];
		}
		// @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
		return outputSpec.map((outputSpecChild) => fillHoleInSpec(outputSpecChild, children));
	}
	return outputSpec;
};

const wrapOutputSpecInMarks = (outputSpec, marks, schema) => {
	return marks.reduce((child, mark) => {
		const { spec: markSpec } = schema.marks[mark.type];
		return fillHoleInSpec(markSpec.toDOM(mark), [child], true);
	}, outputSpec);
};

const normalizeAttrsForSpec = (attrs, spec) => {
	if (spec.attrs) {
		const keptAttrs = {};
		Object.keys(attrs).forEach((key) => {
			if (spec.attrs[key] || (spec.reactiveAttrs && spec.reactiveAttrs[key])) {
				keptAttrs[key] = attrs[key];
			}
		});
		return keptAttrs;
	}
	return null;
};

const createOutputSpecFromNode = (node, schema, context) => {
	const { type, marks, content, attrs = {} } = node;
	const nodeType = schema.nodes[type];
	const { spec: nodeSpec } = nodeType;

	const childSpecs = Array.isArray(content)
		? content.map((child) => createOutputSpecFromNode(child, schema, context))
		: [];

	// @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
	const outputSpec = fillHoleInSpec(
		nodeSpec.toDOM(
			{ ...node, type: nodeType, attrs: normalizeAttrsForSpec(attrs, nodeSpec) },
			{ ...context, isReact: true },
		),
		childSpecs,
	);

	return marks ? wrapOutputSpecInMarks(outputSpec, marks, schema) : outputSpec;
};

export const getReactedDocFromJson = (doc, schema, citationManager, nodeLabels) => {
	const hydratedDoc = Node.fromJSON(schema, doc);
	const reactedDoc = getReactedDoc(hydratedDoc, {
		documentState: {
			citationManager: citationManager,
			nodeLabels: nodeLabels,
		},
	});
	return reactedDoc.toJSON();
};

export const renderStatic = ({
	schema,
	doc,
	reactedDoc,
	citationManager,
	nodeLabels = {},
	context = {},
}) => {
	const finalDoc = reactedDoc || getReactedDocFromJson(doc, schema, citationManager, nodeLabels);
	return finalDoc.content.map((node, index) => {
		const outputSpec = createOutputSpecFromNode(node, schema, context);
		return createReactFromOutputSpec(outputSpec, index);
	});
};
