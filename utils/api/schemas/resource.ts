import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
// import {
// 	resourceKinds,
// 	resourceDescriptors,
// 	resourceSummaryKinds,
// 	resourceContributorRoles,
// 	resourceRelations,
// 	Resource,
// } from 'deposit/resource';

export const resourceKinds = [
	'Book',
	'BookChapter',
	'Journal',
	'JournalIssue',
	'JournalArticle',
	'Conference',
	'ConferenceProceeding',
	'ConferencePaper',
	'Other',
] as const;

export const resourceKindToProperNoun = {
	Book: 'Book',
	BookChapter: 'Book Chapter',
	Journal: 'Journal',
	JournalIssue: 'Journal Issue',
	JournalArticle: 'Journal Article',
	Conference: 'Conference',
	ConferenceProceeding: 'Conference Proceeding',
	ConferencePaper: 'Conference Paper',
	Other: 'Other',
};

export const interWorkResourceRelations = [
	'Comment',
	'Preprint',
	'Reply',
	'Review',
	'Supplement',
	'Translation',
	'Version',
] as const;

export const intraWorkResourceRelations = ['Part', 'Publication'] as const;

export const resourceRelations = [
	...interWorkResourceRelations,
	...intraWorkResourceRelations,
] as const;
export const resourceContributorKinds = ['Person', 'Organization'] as const;
export const resourceContributorRoles = ['Creator', 'Editor', 'Translator', 'Other'] as const;
export const resourceDescriptors = [
	'Explanation',
	'Mechanism',
	'Process',
	'Definition',
	'Other',
] as const;

export const resourceSummaryKinds = ['Synopsis', 'WordCount', 'Other'] as const;

export const resourceIdentifierKinds = ['URL', 'DOI', 'ISSN', 'EISSN', 'ISBN'] as const;

extendZodWithOpenApi(z);

export const partialResourceSchema = z.object({
	title: z.string().openapi({
		description: 'The title of the resource',
	}),
	kind: z.enum(resourceKinds).openapi({
		description: 'The type of resource',
	}),
	identifiers: z.array(
		z.object({
			identifierKind: z.enum(['URL', 'DOI', 'ISSN', 'EISSN', 'ISBN']),
			identifierValue: z.string(),
		}),
	),
});

export const resourceSchema = partialResourceSchema.extend({
	timestamp: z.string().datetime().openapi({
		description: 'The version of the resource expressed as a UTC datetime string',
		example: '2021-01-01T00:00:00.000Z',
	}),
	description: z.string(),

	descriptions: z.array(
		z.object({
			kind: z.enum(resourceDescriptors),
			lang: z.string().openapi({
				description: 'ISO 639-2 language code',
				example: 'eng',
			}),
			text: z.string(),
		}),
	),

	summaries: z.array(
		z.object({
			kind: z.enum(resourceSummaryKinds),
			lang: z.string().openapi({
				description: 'ISO 639-2 language code',
				example: 'eng',
			}),
			value: z.string(),
		}),
	),

	contributions: z.array(
		z.object({
			isAttribution: z.boolean(),
			contributor: z.object({ name: z.string(), orcid: z.string().optional() }),
			contributorAffiliation: z.string().optional(),
			contributorRole: z.enum(resourceContributorRoles),
		}),
	),

	/**
	 * Homogeneous list of inter- and intra-work relationships.
	 */
	relationships: z
		.array(
			z.object({
				isParent: z.boolean(),
				relation: z.enum(resourceRelations),
				resource: z.lazy(() => resourceSchema),
			}),
		)
		.openapi({
			description: 'Homogeneous list of inter- and intra-work relationships',
		}),

	license: z.object({
		uri: z.string(),
		/**
		 * SPDX license identifier.
		 * @see {@link https://spdx.org/licenses}
		 */
		spdxIdentifier: z.string().openapi({
			description: 'SPDX license identifier',
			example: 'CC-BY-4.0',
		}),
	}),

	meta: z.record(z.string()),
});
