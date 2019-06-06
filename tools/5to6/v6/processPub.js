/* eslint-disable no-console */
import { Branch, BranchPermission, PubVersion } from '../../../server/models';

const { matchTransformHash, updateTransformHash } = require('./transformHash');

const generateHash = (length) => {
	const tokenLength = length || 32;
	const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

	let hash = '';
	for (let index = 0; index < tokenLength; index += 1) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return hash;
};

const getBranchIdForVersionId = (versionPermission, transformed) => {
	const { draftBranch, namedBranches, versionToBranch } = transformed;
	const { versionId } = versionPermission;
	if (versionId) {
		const proposedBranchName = versionToBranch[versionId].name;
		if (proposedBranchName) {
			return namedBranches[proposedBranchName].id;
		}
		throw new Error(`No version -> branch mapping exists for version id ${versionId}`);
	} else {
		return draftBranch.id;
	}
};

const updateBranches = async (model, transformed) => {
	const { id: pubId } = model;
	const { draftBranch, namedBranches } = transformed;
	await BranchPermission.destroy({ where: { pubId: pubId } });
	await Branch.destroy({ where: { pubId: pubId } });
	await Branch.bulkCreate(
		[['draft', draftBranch]]
			.concat(Object.entries(namedBranches))
			.map(([title, branch], index, { length }) => {
				return {
					id: branch.id,
					shortId: index + 1,
					title: title,
					order: title === 'public' ? 1 : index / length,
					viewHash: generateHash(8),
					discussHash: generateHash(8),
					editHash: generateHash(8),
					pubId: pubId,
					publicPermissions: title === 'public' ? 'discuss' : 'none',
					pubManagerPermissions: 'manage',
					communityAdminPermissions: 'manage',
				};
			}),
	);

	await BranchPermission.bulkCreate(
		model.versionPermissions.map((versionPermission) => {
			const { createdAt, permissions, updatedAt, userId } = versionPermission;
			const branchId = getBranchIdForVersionId(versionPermission, transformed);
			return {
				createdAt: createdAt,
				updatedAt: updatedAt,
				userId: userId,
				pubId: pubId,
				branchId: branchId,
				permissions: permissions,
			};
		}),
	);
};

const createVersions = async (transformed) => {
	const { versionToBranch, versionToShortCode } = transformed;
	return PubVersion.bulkCreate(
		Object.keys(versionToBranch).map((versionId) => {
			const { id: branchId, key: historyKey } = versionToBranch[versionId];
			const shortCode = versionToShortCode[versionId];
			return {
				branchId: branchId,
				shortCode: shortCode,
				historyKey: historyKey,
			};
		}),
	);
};

const stripExtraneousKeys = (branchObj, strip = ['id']) => {
	const res = {};
	Object.keys(branchObj).forEach((key) => {
		if (strip.includes(key)) {
			return;
		}
		res[key] = branchObj;
	});
	return res;
};

const createFirebaseJson = (transformed) => {
	const branches = {};
	const { draftBranch, namedBranches } = transformed;
	branches[`branch-${draftBranch.id}`] = stripExtraneousKeys(draftBranch);
	Object.values(namedBranches).forEach((branch) => {
		branches[`branch-${branch.id}`] = stripExtraneousKeys(branch);
	});
	return branches;
};

const processPub = async (storage, pubId, writeToFirebase, { current, total }) => {
	console.log(`~~~~~~~~ Processing pub ${pubId} (${current}/${total}) ~~~~~~~~`);
	const pubDir = storage.within(`pubs/${pubId}`);
	const model = JSON.parse(pubDir.read('model.json'));
	const { transformed } = JSON.parse(pubDir.read('transformed.json'));
	const firebaseJson = createFirebaseJson(transformed);
	const hasTransformBeenUploaded = matchTransformHash(pubDir);
	if (hasTransformBeenUploaded) {
		console.log('OK: already wrote this pub');
	} else {
		try {
			await updateBranches(model, transformed);
			await writeToFirebase(pubId, firebaseJson);
			await createVersions(transformed);
			updateTransformHash(pubDir);
			console.log('OK: wrote this pub successfully!');
		} catch (error) {
			console.log('FAILURE:', error.toString());
		}
	}
};

module.exports = processPub;
