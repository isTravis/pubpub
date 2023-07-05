/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-bitwise */
/* eslint-disable no-restricted-syntax */
// ./type-printer.ts
import { checkServerIdentity } from 'tls';
import * as ts from 'typescript';
import fs from 'fs';
import { join } from 'path';
import { diffWordsWithSpace, diffLines } from 'diff';

function findFlags(flag: number): string[] {
	const flagValues = Object.values(ts.TypeFlags) as number[];
	const matchingFlags: string[] = [];

	flagValues.forEach((flagValue: number) => {
		if ((flagValue & flag) !== 0) {
			matchingFlags.push(ts.TypeFlags[flagValue]);
		}
	});

	return matchingFlags;
}

function hasFlag(flag: number, flagToCheck: number): boolean {
	return (flag & flagToCheck) !== 0;
}

function extractTypeSignature(filename: string) {
	const program = ts.createProgram([filename], { emitDeclarationOnly: true });
	const sourceFile = program.getSourceFile(filename);
	const typeChecker = program.getTypeChecker();
	// Get the declaration node you're looking for by it's type name.
	// This condition can be adjusted to your needs
	// const statement: ts.Statement | undefined = sourceFile.statements.find(
	// 	(s) => ts.isTypeAliasDeclaration(s) && s.name.text === aliasName,
	// );

	const statements = sourceFile?.statements.reduce((acc, s) => {
		if (!ts.isTypeAliasDeclaration(s) || !/\d$/.test(s.name.text)) {
			return acc;
		}

		const matches = s.name.text.match(/(.*)(\d)$/);
		if (!matches) {
			return acc;
		}

		const name = matches[1];
		const num = matches[2];

		if (num === '1') {
			acc[name] = [s, s];
			return acc;
		}

		if (num === '2') {
			acc[name][1] = s;
			return acc;
		}
		return acc;
	}, {} as Record<string, [ts.Statement, ts.Statement]>);

	// if (!statement) {
	// 	throw new Error(`Type: '${aliasName}' not found in file: '${filename}'`);
	// }

	const types =
		Object.entries(statements!).map(([name, stat]) => {
			const types = stat.map((statement) => {
				const type: ts.Type = typeChecker.getTypeAtLocation(statement);
				// Iterate over the `ts.Symbol`s representing Property Nodes of `ts.Type`
				const fields = type.getProperties().map((prop: ts.Symbol) => {
					const name: string = prop.getName();
					const decl = prop.getDeclarations()![0];
					const optional = typeChecker.isOptionalParameter(decl);

					// consttypeChecker.getTypeAtLocation(prop.valueDeclaration);
					const propType: ts.Type = typeChecker.getTypeOfSymbolAtLocation(
						prop,
						prop.declarations?.[0],
					);

					const propTypeName: string = typeChecker.typeToString(propType, undefined);
					if (name === 'htmlTitle') {
						console.dir(propType.isUnion());
						// console.dir(prop.declarations?.[0]?.type.types, { depth: 4 });
					}
					const hasNull = (declaration: ts.PropertyDeclaration) => {
						const types = declaration.type?.types;
						if (!types) {
							return false;
						}

						return types.some((type) => {
							return (
								type.kind === ts.SyntaxKind.LiteralType &&
								type.literal.kind === ts.SyntaxKind.NullKeyword
							);
						});
					};

					return `${name}${optional ? '?' : ''}: ${propTypeName}${
						hasNull(prop.declarations?.[0]) ? ' | null' : ''
					};`;
				});
				return `{\n  ${fields.join('\n  ')}\n}`;
			});

			return { name, types };
		}) ?? [];
	return types;
}

const typeBSignature = extractTypeSignature('./example.ts');

const diffs = [typeBSignature, typeBSignature].map((sig, idx) =>
	sig.map((s) => {
		const [s1, s2] =
			s.types.map(
				(str) =>
					str
						?.replace(/ & { \[CreationAttributeBrand\]\?: true/g, '')
						?.match(/{([\s\S]*)}/)?.[1]
						?.split(';')
						.map((pair) => pair.trim()) ?? [],
			) ?? [];

		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return { name: s.name, type: generateDiff(s1, s2, !!idx) };
	}),
);

// write to file or console log

diffs.forEach((diff, idx) => {
	if (idx === 0) {
		fs.writeFileSync(
			join(__dirname, 'diffs.md'),
			diff
				.map((str) => `## ${str.name}\n\n\n\`\`\`diff\n${str.type.join('\n')}\n\`\`\`\n`)
				.join('\n\n\n'),
		);
		return;
	}
	fs.writeFileSync(
		join(__dirname, 'diffs-rich.md'),
		diff
			.map((str) => `## ${str.name}\n\n\n<pre>\n{\n  ${str.type.join('\n  ')}\n}</pre>\n\n`)
			.join('\n\n\n'),
	);
});
/*
type TypeB = {
  prop1: string;
}
*/

function getKeyOptionalValue(pair: string) {
	const matches = pair.match(/(.*?)(\??): (.*)/);
	const key = matches?.[1];
	const value = matches?.[3];
	const optional = matches?.[2];
	return [key, optional, value];
}

function generateDiff(obj1Pairs: string[], obj2Pairs: string[], rich = false) {
	const diff: string[] = [];

	// Find added and updated properties
	for (const pair of obj2Pairs) {
		const [key, optional, value] = getKeyOptionalValue(pair);

		if (key === undefined) {
			continue;
		}
		const matchingPair = obj1Pairs.find((p) => {
			const [oldkey, oldvalue] = p.split(/\??:/);
			return key === oldkey;
		});

		if (!matchingPair) {
			if (rich) {
				diff.push(`<ins style="background:green">${key}${optional}: ${value}</ins>`);
			} else {
				diff.push(`+ ${pair}`);
			}
			continue;
		}

		if (rich) {
			const charDiff = diffWordsWithSpace(matchingPair, pair);
			diff.push(
				charDiff
					.map((d) => {
						if (d.added) {
							return `<ins style="background:green">${d.value}</ins>`;
						}
						if (d.removed) {
							return `<del style="background:red">${d.value}</del>`;
						}
						return d.value;
					})
					?.join(''),
			);
		} else {
			const lineDiff = diffLines(matchingPair, pair);
			diff.push(
				lineDiff
					.map((d) => (d.added ? `+ ${d.value}` : d.removed ? `- ${d.value}` : d.value))
					.join('\n'),
			);
			// diff.push(`- ${matchingPair}`);
			// diff.push(`+ ${pair}`);
		}
		// const [oldKey, oldOptional, oldValue] = getKeyOptionalValue(matchingPair);
		// const valueWithoutBrand = value?.replace(' & { [CreationAttributeBrand]?: true', '');
		// if (valueWithoutBrand !== oldValue || optional !== oldOptional) {
		// 	diff.push(`- ${oldKey}${oldOptional}: ${oldValue}`);
		// 	diff.push(`+ ${key}${optional}: ${valueWithoutBrand}`);
		// }
	}

	// Find removed properties
	for (const pair of obj1Pairs) {
		const [key, optional, value] = getKeyOptionalValue(pair);
		if (key === undefined) {
			continue;
		}

		// const matchingPair = obj2Pairs.find((p) => p.startsWith(key));
		const matchingPair = obj2Pairs.find((p) => {
			const [oldkey, oldvalue] = p.split(/\??:/);
			return key === oldkey;
		});

		if (matchingPair) {
			continue;
		}

		if (rich) {
			diff.push(`<del style="background: red">${key}${optional}: ${value}</del>`);
		} else {
			diff.push(`- ${pair}`);
		}
	}

	return diff;
}
