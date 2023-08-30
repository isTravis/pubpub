import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { pubContract } from './contracts/pub';
import { collectionPubContract } from './contracts/collectionPub';
import { collectionContract } from './contracts/collection';
import { collectionAttributionContract } from './contracts/collectionAttribution';
import { exportRoute } from './contracts/export';
import { facetsContract } from './contracts/facets';
import { loginRoute } from './contracts/login';
import { logoutRoute } from './contracts/logout';
import { memberContract } from './contracts/member';
import { pageContract } from './contracts/page';
import { pubAttributionContract } from './contracts/pubAttribution';
import { pubEdgeContract } from './contracts/pubEdge';
import { workerTaskContract } from './contracts/workerTask';
import { importRoute } from './contracts/import';

extendZodWithOpenApi(z);

const c = initContract();

export const contract = c.router(
	{
		collection: collectionContract,
		collectionAttribution: collectionAttributionContract,
		collectionPub: collectionPubContract,
		export: exportRoute,
		facets: facetsContract,
		import: importRoute,
		member: memberContract,
		page: pageContract,
		pub: pubContract,
		pubAttribution: pubAttributionContract,
		pubEdge: pubEdgeContract,
		workerTask: workerTaskContract,
		login: loginRoute,
		logout: logoutRoute,
	},
	{
		strictStatusCodes: true,
	},
);
