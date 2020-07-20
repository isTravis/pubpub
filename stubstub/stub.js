/* global beforeAll, afterAll */
import sinon from 'sinon';

import { getEmptyDoc } from 'components/Editor';
import * as firebaseAdmin from '../server/utils/firebaseAdmin';

const stubManyFunctions = (module, stubEntries) =>
	Object.fromEntries(
		stubEntries.map(([key, value]) => {
			const stub = sinon.stub(module, key);
			if (value) {
				stub.callsFake(value);
			}
			return [key, stub];
		}),
	);

const getStubEntries = (functions) => {
	if (typeof functions === 'object') {
		if (Array.isArray(functions)) {
			return functions.map((fn) => [fn, null]);
		}
		return Object.entries(functions);
	}
	return [[functions, null]];
};

export const stubModule = (module, functions) => {
	const stubEntries = getStubEntries(functions);
	const stubs = stubManyFunctions(module, stubEntries);
	return {
		stubs: stubs,
		restore: () => Object.values(stubs).forEach((stub) => stub.restore()),
	};
};

export const stubOut = (module, functions, before = beforeAll, after = afterAll) => {
	if (typeof module === 'string') {
		// lol,
		// eslint-disable-next-line
		module = require(module);
	}
	let restore;
	before(() => {
		restore = stubModule(module, functions).restore;
	});
	after(() => {
		if (restore) {
			restore();
		}
	});
};

export const stubFirebaseAdmin = () => {
	let stubs;

	beforeAll(() => {
		const getBranchDocStub = sinon.stub(firebaseAdmin, 'getBranchDoc').returns({
			doc: getEmptyDoc(),
			mostRecentRemoteKey: 0,
			historyData: {
				timestamps: {},
				currentKey: 0,
				latestKey: 0,
			},
		});
		const getFirebaseTokenStub = sinon.stub(firebaseAdmin, 'getFirebaseToken').returns('');
		const createFirebaseBranchStub = sinon
			.stub(firebaseAdmin, 'createFirebaseBranch')
			.returns({});
		const mergeFirebaseBranchStub = sinon
			.stub(firebaseAdmin, 'mergeFirebaseBranch')
			.returns({});
		stubs = [
			getBranchDocStub,
			getFirebaseTokenStub,
			createFirebaseBranchStub,
			mergeFirebaseBranchStub,
		];
	});

	afterAll(() => stubs.forEach((stub) => stub.restore()));
};
