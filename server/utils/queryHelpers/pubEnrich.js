import { buildSchema, jsonToNode, getNotes } from 'components/Editor';
import discussionSchema from 'containers/Pub/PubDocument/DiscussionAddon/discussionSchema';
import { Branch } from 'server/models';
import { generateCiteHtmls } from 'server/editor/queries';
import { generateCitationHTML } from 'server/utils/citations';
import { getBranchDoc, getFirebaseToken } from 'server/utils/firebaseAdmin';

export const enrichPubFirebaseDoc = async (pubData, versionNumber, branchType) => {
	const activeBranch = pubData.branches.find((branch) => {
		return branch.title === branchType;
	});
	if (!activeBranch) {
		throw new Error('Pub Not Found');
	}
	const {
		doc,
		historyData,
		mostRecentRemoteKey,
		firstTimestamp,
		latestTimestamp,
	} = await getBranchDoc(pubData.id, activeBranch.id, versionNumber, true);

	if (firstTimestamp || latestTimestamp) {
		const update = {
			...(firstTimestamp && { firstKeyAt: new Date(firstTimestamp) }),
			...(latestTimestamp && { latestKeyAt: new Date(latestTimestamp) }),
		};
		await Branch.update(update, { where: { id: activeBranch.id } });
	}

	return {
		...pubData,
		activeBranch: activeBranch,
		initialDoc: doc,
		initialDocKey: mostRecentRemoteKey,
		historyData: historyData,
	};
};

export const enrichPubFirebaseToken = async (pubData, initialData) => {
	const {
		canView,
		canViewDraft,
		canEdit,
		canEditDraft,
		canManage,
	} = initialData.scopeData.activePermissions;
	const firebaseToken = await getFirebaseToken(initialData.loginData.id || 'anon', {
		branchId: `branch-${pubData.activeBranch.id}`,
		canEditBranch: canEdit || canEditDraft,
		canViewBranch: canView || canViewDraft || pubData.isRelease,
		canManage: canManage,
		userId: initialData.loginData.id,
	});
	return {
		...pubData,
		firebaseToken: firebaseToken,
	};
};

export const enrichPubCitations = async (pubData, initialData) => {
	const { initialDoc, citationStyle } = pubData;
	const { footnotes: footnotesRaw, citations: citationsRaw } = initialDoc
		? getNotes(jsonToNode(initialDoc, buildSchema({ ...discussionSchema }, {})))
		: { footnotes: [], citations: [] };

	const footnotesData = await generateCiteHtmls(footnotesRaw, citationStyle);
	const citationsData = await generateCiteHtmls(citationsRaw, citationStyle);
	const citationHtml = await generateCitationHTML(pubData, initialData.communityData);
	return {
		...pubData,
		footnotes: footnotesData,
		citations: citationsData,
		citationData: citationHtml,
	};
};
