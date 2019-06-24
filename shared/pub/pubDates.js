export const getPubPublishedDate = (pub, branch = null) => {
	// eslint-disable-next-line no-param-reassign
	if (!branch && !pub.branches) {
		return null;
	}
	const selectedBranch = branch || pub.branches.find((br) => br.title === 'public');
	if (selectedBranch) {
		if (!pub.branches.some((br) => br.id === selectedBranch.id)) {
			throw new Error(`Branch ${selectedBranch.id} not a member of pub ${pub.id}!`);
		}
		if (selectedBranch.publishedAt) {
			return new Date(selectedBranch.publishedAt);
		}
		if (selectedBranch.updatedAt) {
			return new Date(selectedBranch.updatedAt);
		}
	}
	return null;
};
