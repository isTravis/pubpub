import { toTitleCase } from 'utils/strings';

export const relationTypeDefinitions = {
	comment: {
		name: 'Comment',
		article: 'a',
		preposition: 'on',
		isIntraWork: false,
		crossrefRelationshipTypes: ['isCommentOn', 'hasComment'],
	},
	commentary: {
		name: 'Commentary',
		article: 'a',
		preposition: 'on',
		isIntraWork: false,
		crossrefRelationshipTypes: ['isCommentOn', 'hasComment'],
	},
	preprint: {
		name: 'Preprint',
		article: 'a',
		preposition: 'of',
		isIntraWork: true,
		crossrefRelationshipTypes: ['isPreprintOf', 'hasPreprint'],
	},
	rejoinder: {
		name: 'Rejoinder',
		article: 'a',
		preposition: 'to',
		isIntraWork: false,
		crossrefRelationshipTypes: ['isReplyTo', 'hasReply'],
	},
	reply: {
		name: 'Reply',
		article: 'a',
		preposition: 'to',
		isIntraWork: false,
		crossrefRelationshipTypes: ['isReplyTo', 'hasReply'],
	},
	review: {
		name: 'Review',
		article: 'a',
		preposition: 'of',
		isIntraWork: false,
		crossrefRelationshipTypes: ['isReviewOf', 'hasReview'],
	},
	supplement: {
		name: 'Supplement',
		article: 'a',
		preposition: 'of',
		isIntraWork: false,
		crossrefRelationshipTypes: ['isSupplementTo', 'isSupplementedBy'],
	},
	translation: {
		name: 'Translation',
		article: 'a',
		preposition: 'of',
		isIntraWork: true,
		crossrefRelationshipTypes: ['isTranslationOf', 'hasTranslation'],
	},
	version: {
		name: 'Version',
		article: 'a',
		preposition: 'of',
		isIntraWork: true,
		crossrefRelationshipTypes: ['isVersionOf', 'hasVersion'],
	},
};

const createRelationTypeEnum = () => {
	const res = {};
	Object.entries(relationTypeDefinitions).forEach(([key]) => {
		res[toTitleCase(key)] = key;
	});
	return res;
};

export const relationTypes = Object.keys(relationTypeDefinitions);
export const RelationType = createRelationTypeEnum();

const findParentEdge = (pubEdges, relationTypes, inbound) => {
	for (let i = 0; i < pubEdges.length; i++) {
		const pubEdge = pubEdges[i];
		const { pubIsParent, relationType } = pubEdge;

		if (inbound ? pubIsParent : !pubIsParent) {
			for (let j = 0; j < relationTypes.length; j++) {
				if (relationType === relationTypes[j]) {
					return pubEdge;
				}
			}
		}
	}

	return null;
};

export const findParentEdgeByRelationTypes = (pub, relationTypes) => {
	const { inboundEdges, outboundEdges } = pub;

	return (
		findParentEdge(inboundEdges, relationTypes, true) ||
		findParentEdge(outboundEdges, relationTypes) ||
		null
	);
};
