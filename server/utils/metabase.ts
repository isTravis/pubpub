import jwt from 'jsonwebtoken';

export const generateMetabaseToken = (scopeType, scopeId, dashboardType) => {
	const dashboardNums = {
		community: {
			base: 2,
			benchmark: 8,
		},
		collection: {
			base: 7,
		},
		pub: {
			base: 3,
			benchmark: 9,
		},
		pubpub: {
			base: 6,
		},
	};
	const dashboardNum = dashboardNums[scopeType][dashboardType];
	const payload = {
		resource: { dashboard: dashboardNum },
		params: {
			[scopeType]: scopeId,
		},
		exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
	};

	const metabaseSecretKey = process.env.METABASE_SECRET_KEY;

	if (!metabaseSecretKey) {
		throw new Error('METABASE_SECRET_KEY environment variable not set');
	}

	return jwt.sign(payload, metabaseSecretKey);
};
