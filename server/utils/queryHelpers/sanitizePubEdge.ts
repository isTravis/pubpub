import { expect } from 'utils/assert';

const isCommunityMember = (memberData, pub) =>
	memberData.some((member) => member.communityId === pub.communityId);

const isCollectionMember = (memberData, pub) =>
	memberData.some((member) =>
		expect(pub.collectionPubs).some(
			(collectionPub) => member.collectionId === collectionPub.collectionId,
		),
	);

const isPubMember = (memberData, pub) => memberData.some((member) => member.pubId === pub.id);

const canViewPubEdge = (initialData, pubEdge) => {
	const {
		scopeData: {
			memberData,
			elements: { activeCommunity },
		},
	} = initialData;
	const { pub, targetPub } = pubEdge;
	if (!pub && !targetPub) {
		return true;
	}
	const pubToInspect = expect(targetPub || pub);
	if (pubToInspect.communityId === activeCommunity.id) {
		if (
			isPubMember(memberData, pubToInspect) ||
			isCollectionMember(memberData, pubToInspect) ||
			isCommunityMember(memberData, pubToInspect)
		) {
			return true;
		}
	}
	return pubToInspect.releases && pubToInspect.releases.length > 0;
};

const stripValuesFromPub = (pub) => {
	if (pub) {
		return { ...pub, collectionPubs: undefined };
	}
	return pub;
};

export const sanitizePubEdge = (initialData, pubEdge) => {
	if (canViewPubEdge(initialData, pubEdge)) {
		return {
			...pubEdge,
			pub: stripValuesFromPub(pubEdge.pub),
			targetPub: stripValuesFromPub(pubEdge.targetPub),
		};
	}
	return null;
};

export const sanitizePubEdges = (initialData, pubEdges) => {
	return pubEdges.map((edge) => sanitizePubEdge(initialData, edge)).filter((x) => x);
};
