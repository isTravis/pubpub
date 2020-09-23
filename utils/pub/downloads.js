export const getFormattedDownloadUrl = (pubData, requiredFormat) => {
	const { downloads } = pubData;
	if (!downloads) {
		return null;
	}
	const download = downloads.reduce((best, next) => {
		const isNewer = !best || !best.createdAt || next.createdAt > best.createdAt;
		const isCorrectFormat = !requiredFormat || next.url.endsWith(requiredFormat);
		if (next.type === 'formatted' && isNewer && isCorrectFormat) {
			return next;
		}
		return best;
	}, null);
	if (download) {
		return download.url;
	}
	return null;
};

export const getPublicExportUrl = (pubData, format) => {
	const { branches, releases } = pubData;
	const publicBranch = branches.find((b) => b.title === 'public');
	if (publicBranch && publicBranch.exports && releases && releases.length) {
		const latestHistoryKey = releases.map((r) => r.branchKey).reduce((a, b) => Math.max(a, b));
		if (typeof latestHistoryKey === 'number') {
			const validExport = publicBranch.exports.find(
				(exp) => exp.historyKey === latestHistoryKey && exp.format === format,
			);
			if (validExport) {
				return validExport.url;
			}
		}
	}
	return null;
};

export const getBestDownloadUrl = (pubData, requiredFormat) => {
	const formattedDownloadUrl = getFormattedDownloadUrl(pubData, requiredFormat);
	if (formattedDownloadUrl) {
		return formattedDownloadUrl;
	}
	return getPublicExportUrl(pubData, requiredFormat || 'pdf');
};
