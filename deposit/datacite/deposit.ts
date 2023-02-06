import { renderXml } from '@pubpub/deposit-utils/datacite';
import { Resource } from 'deposit/types';
import { getCommunityDepositTarget } from 'server/depositTarget/queries';
import { persistCrossrefDepositRecord, persistDoiData } from 'server/doi/queries';
import { Collection, DefinitelyHas, Pub } from 'types';
import { expect } from 'utils/assert';
import { createDataciteDoiWithMetadata, createDeposit, updateDataciteDoiMetadata } from './index';

type Scope = DefinitelyHas<Collection | Pub, 'community'>;

export function loadScopeResourceMeta(scope: Scope, scopeResource: Resource, scopeDoi: string) {
	scopeResource.identifiers.push({
		identifierKind: 'DOI',
		identifierValue: scopeDoi,
	});
	scopeResource.meta['created-date'] = scope.createdAt.toString();
	if (scope.updatedAt !== scope.createdAt) {
		scopeResource.meta['updated-date'] = scope.updatedAt.toString();
	}
	scopeResource.meta['publisher'] = scope.community.publishAs || 'PubPub';
}

const R_MISSING_ELEMENT =
	/Missing child element.*\{http:\/\/datacite.org\/schema\/kernel-4\}(\w+).*\)./;
const dataciteEntityToPubPubNoun = {
	creator: 'byline contributor',
};

export async function prepareResource(scope: Scope, scopeResource: Resource, scopeDoi: string) {
	loadScopeResourceMeta(scope, scopeResource, scopeDoi);
	const resourceAst = createDeposit(scopeResource);
	try {
		const resourceXml = await renderXml(resourceAst);
		return { resourceAst, resourceXml };
	} catch (error) {
		let matches = (error as Error).message?.match(R_MISSING_ELEMENT);
		if (matches) {
			const dataciteEntity = matches[1];
			throw new Error(
				`Datacite deposits require at least one ${
					dataciteEntityToPubPubNoun[dataciteEntity] ?? dataciteEntity
				}.`,
			);
		}
		throw error;
	}
}

function isPub(scope: Scope): scope is DefinitelyHas<Pub, 'community'> {
	return 'pubVersions' in scope;
}

export async function submitResource(
	scope: Scope,
	scopeResource: Resource,
	scopeDoi: string,
	requestIds: { pubId: string } | { collectionId: string },
) {
	const depositTarget = expect(await getCommunityDepositTarget(scope.communityId, true));
	const { resourceXml, resourceAst } = await prepareResource(scope, scopeResource, scopeDoi);
	const { identifierValue: resourceUrl } = expect(
		scopeResource.identifiers.find((identifier) => identifier.identifierKind === 'URL'),
	);
	const depositResult = await (scope.crossrefDepositRecordId
		? updateDataciteDoiMetadata
		: createDataciteDoiWithMetadata)(resourceXml, resourceUrl, scopeDoi, depositTarget);
	await Promise.all([
		persistDoiData(requestIds, isPub(scope) ? { pub: scopeDoi } : { collection: scopeDoi }),
		persistCrossrefDepositRecord(requestIds, depositResult),
	]);
	return { depositResult, resourceAst };
}
