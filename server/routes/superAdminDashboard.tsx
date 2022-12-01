import React from 'react';

import Html from 'server/Html';
import app from 'server/server';
import { superAdminTabKinds, SuperAdminTabKind, getSuperAdminTabUrl } from 'utils/superAdmin';
import { ForbiddenError, handleErrors, NotFoundError } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
import { getLandingPageFeatures } from 'server/landingPageFeature/queries';
import { queryCommunitiesForSpamManagement } from 'server/spamTag/communities';

const getTabProps = async (tabKind: SuperAdminTabKind) => {
	if (tabKind === 'landingPageFeatures') {
		return { landingPageFeatures: await getLandingPageFeatures({ onlyValidItems: false }) };
	}
	if (tabKind === 'spam') {
		return {
			communities: await queryCommunitiesForSpamManagement({
				status: ['unreviewed'],
				ordering: { field: 'spam-score', direction: 'DESC' },
				limit: 50,
				offset: 0,
			}),
		};
	}
	return {};
};

app.get('/superadmin', async (_, res) => {
	const [firstTab] = superAdminTabKinds;
	return res.redirect(getSuperAdminTabUrl(firstTab));
});

app.get('/superadmin/:tabKind', async (req, res, next) => {
	try {
		const { tabKind } = req.params;
		if (!superAdminTabKinds.includes(tabKind)) {
			throw new NotFoundError();
		}
		const initialData = await getInitialData(req);
		if (!initialData.loginData.isSuperAdmin) {
			throw new ForbiddenError();
		}
		return renderToNodeStream(
			res,
			<Html
				chunkName="SuperAdminDashboard"
				initialData={initialData}
				viewData={{ tabKind, tabProps: await getTabProps(tabKind) }}
				headerComponents={generateMetaComponents({
					initialData,
					title: 'SuperAdmin · PubPub',
					description: "Well aren't you special",
					unlisted: true,
				})}
			/>,
		);
	} catch (err) {
		return handleErrors(req, res, next)(err);
	}
});
