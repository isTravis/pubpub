import { isDevelopment } from 'utils/environment';

export const hostIsValid = (req, access) => {
	// This should be merged with the check in getInitialData
	const shouldForceBasePubPub = !!(isDevelopment() && process.env.FORCE_BASE_PUBPUB);
	const isBasePubPub = shouldForceBasePubPub || req.hostname === 'www.pubpub.org';
	if (!isBasePubPub && access !== 'community') {
		return false;
	}
	if (isBasePubPub && access !== 'pubpub') {
		return false;
	}
	return true;
};
