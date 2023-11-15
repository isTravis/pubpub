import {
	Project,
	Node,
	ObjectLiteralExpression,
	PropertyAssignment,
	JSDoc,
	PropertyDeclaration,
	ts,
	SyntaxKind,
} from 'ts-morph';
import { execSync } from 'child_process';

function updateJSDocComments(dir: string, template) {
	const project = new Project({
		tsConfigFilePath: 'tsconfig.json',
	});

	const sourceFiles = project.getSourceFiles(dir);

	sourceFiles.forEach((sourceFile) => {
		sourceFile.forEachDescendant((node) => {
			if (node.getKind() === SyntaxKind.PropertyAssignment) {
				const propertyAssignment = node.asKind(SyntaxKind.PropertyAssignment);
				const initializer = propertyAssignment?.getInitializerIfKind(
					SyntaxKind.ObjectLiteralExpression,
				);

				if (initializer && initializer.getProperty('path')) {
					const summary = initializer.getProperty('summary')?.getText();
					const description = initializer
						.getProperty('description')
						?.getChildAtIndex(2)
						?.getText();
					// Check for existing JSDoc comments
					const comments = propertyAssignment.getLeadingCommentRanges();

					let existingComment = '';
					let startPos = propertyAssignment?.getStart();
					if (comments.length > 0) {
						// Assuming the last comment is the relevant one
						const lastComment = comments[comments.length - 1];
						existingComment = sourceFile
							.getFullText()
							.substring(lastComment.getPos(), lastComment.getEnd());

						// Process the existing comment (example: log it)
						console.log('Existing Comment:', existingComment);

						const commentStartPos = lastComment.getPos();
						startPos = commentStartPos;
						// Remove the existing comment
						// lastComment.remove();
						sourceFile.removeText(commentStartPos, lastComment.getEnd());
					}

					// Your logic to generate a new comment, possibly using existingComment data
					const newJsDocComment = `/**\n * ${summary}\n *\n * @description\n * ${description}\n */`;

					// Determine position for inserting the new JSDoc comment

					// Insert the new JSDoc comment
					sourceFile.insertText(startPos, newJsDocComment);
				}
			}
		});
		// sourceFile.forEachDescendant((node) => {
		// 	if (isObjectLiteralExpression(node) && Boolean(node.getProperty('path'))) {
		// 		const parent = node.getParent() as PropertyDeclaration;
		// 		console.log({
		// 			nodeText: node.getText(),
		// 			node: node,
		// 			parentText: parent.getText(),
		// 			parentParent: parent.getParent(),
		// 			parent,
		// 			parentNode: parent.compilerNode,
		// 			parentJsdoc: parent.compilerNode.jsDoc,
		// 		});

		// 		const parentNode = parent.compilerNode;

		// 		parent.compilerNode.jsDoc[0].comment = 'gayboy';

		// 		// properties.forEach((property) => {
		// 		// 	const propNode = node.getProperty(property);
		// 		// 	if (propNode) {
		// 		// 		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		// 		// 		const comment = createJSDocCommentFromTemplate(propNode, template);

		// 		// 		// Add or replace JSDoc comment
		// 		// 		const existingComments = parent.getLeadingCommentRanges();
		// 		// 		if (existingComments.length) {
		// 		// 			existingComments[0].replaceWithText(comment);
		// 		// 		} else {
		// 		// 			parent.({ description: comment });
		// 		// 		}
		// 		// 	}
		// 		// });
		// 	}
		// });

		// let thing;
		// let isParent = false;
		// sourceFile.transform((traversal) => {
		// 	const node = traversal.visitChildren(); // recommend always visiting the children first (post order)

		// 	if (isParent) {
		// 		isParent = false;

		// 		return ts.factory.updatePropertyAssignment(node, node.name);
		// 		ts.factory.updateExpressionStatement;
		// 	}
		// 	// console.log(node);
		// 	if (!ts.isObjectLiteralExpression(node)) {
		// 		return node;
		// 	}
		// 	const hasPath = node.properties.some((prop) => prop?.name?.getText() === 'path');

		// 	if (!hasPath) {
		// 		return node;
		// 	}
		// 	const thing = node.properties.reduce((acc, prop) => {
		// 		const name = prop.name?.getText();
		// 		if (!name) {
		// 			return acc;
		// 		}
		// 		acc[name] = prop
		// 			.getChildren()
		// 			.find((child) => child.kind === ts.SyntaxKind.StringLiteral)
		// 			?.getText();
		// 		return acc;
		// 	}, {});

		// 	console.log(node);

		// 	console.log(thing);
		// 	const parent = node.parent;

		// 	parent.jsDoc = ts.factory.createJSDocComment('gayboy');
		// 	console.log(parent.kind);
		// 	console.log(parent.jsDoc);

		// 	return node;
		// });
		sourceFile.saveSync();
	});

	execSync(`npx prettier ${dir} -w`);
}

const template = ({ summary, description, path, method, metadata }: Record<string, any>) => [
	`/**`,
	` * ${method} ${path}`,
	summary ? ` * ${summary}` : '',
	description ? ` * @description\n * ${description}` : '',
];

function createJSDocCommentFromTemplate(node: PropertyAssignment, template: string) {
	let comment = template;
	const properties = node.getProperties();

	properties.forEach((prop) => {
		const propName = prop.getName();
		const propValue = prop.getInitializer()?.getText() || '';
		comment = comment.replace(`{{${propName}}}`, propValue);
	});

	return comment;
}

// Usage Example
updateJSDocComments('utils/api/contracts/workerTask.ts', '/** {{summary}} - {{description}} */');
