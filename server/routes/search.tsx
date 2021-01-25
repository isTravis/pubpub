import React from 'react';
import algoliasearch from 'algoliasearch';

import Html from 'server/Html';
import app from 'server/server';
import { handleErrors } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
import { InitialData } from 'utils/types';

const client = algoliasearch(process.env.ALGOLIA_ID!, process.env.ALGOLIA_KEY!);
const searchId = process.env.ALGOLIA_ID!;
const searchKey = process.env.ALGOLIA_SEARCH_KEY!;

const filterValueAgainstKeys = (keys: string[], value: string) => {
	const keyValuePairs = keys.map((key) => `${key}:${value}`);
	return keyValuePairs.join(' OR ');
};

const limitToCommunity = (initialData: InitialData, filter: string) => {
	const { locationData, communityData } = initialData;
	if (locationData.isBasePubPub) {
		return `communityId:${communityData.id} AND (${filter})`;
	}
	return filter;
};

const getPrivateAccessFilter = (initialData: InitialData, baseFilter: string, keys: string[]) => {
	const {
		loginData: { id: userId },
	} = initialData;
	if (userId) {
		const privateFilter = filterValueAgainstKeys(keys, userId);
		return `${baseFilter} OR ${privateFilter}`;
	}
	return baseFilter;
};

const createFilter = (
	initialData: InitialData,
	publicAccessKeys: string[],
	privateAccessKeys: string[],
) => {
	const publicFilter = filterValueAgainstKeys(publicAccessKeys, 'true');
	const privateAccessFilter = getPrivateAccessFilter(
		initialData,
		publicFilter,
		privateAccessKeys,
	);
	const limitedToCommunity = limitToCommunity(initialData, privateAccessFilter);
	return limitedToCommunity;
};

app.get('/search', async (req, res, next) => {
	try {
		const initialData = await getInitialData(req);

		const pubsSearchKey = client.generateSecuredApiKey(searchKey, {
			filters: createFilter(
				initialData,
				['isPublic', 'branchIsPublic'],
				['branchAccessIds', 'userIdsWithAccess'],
			),
		});
		const pagesSearchKey = client.generateSecuredApiKey(searchKey, {
			filters: createFilter(initialData, ['isPublic'], ['pageAccessIds']),
		});

		const searchData = {
			searchId: searchId,
			pubsSearchKey: pubsSearchKey,
			pagesSearchKey: pagesSearchKey,
		};

		return renderToNodeStream(
			res,
			<Html
				chunkName="Search"
				initialData={initialData}
				viewData={{ searchData: searchData }}
				headerComponents={generateMetaComponents({
					initialData: initialData,
					title: `Search · ${initialData.communityData.title}`,
					description: `Search for pubs in ${initialData.communityData.title}`,
				})}
			/>,
		);
	} catch (err) {
		return handleErrors(req, res, next)(err);
	}
});
