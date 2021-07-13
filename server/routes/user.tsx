import React from 'react';

import Html from 'server/Html';
import app from 'server/server';
import { getUser } from 'server/utils/queryHelpers';
import { handleErrors } from 'server/utils/errors';
import { getInitialData } from 'server/utils/initData';
import { generateMetaComponents, renderToNodeStream } from 'server/utils/ssr';
import { getCountOfPubsOrCollections } from 'server/community/queries';
// check if member has any pubs or collections for user

app.get(['/user/:slug', '/user/:slug/:mode'], async (req, res, next) => {
	try {
		const initialData = await getInitialData(req);
		const userData = await getUser(req.params.slug, initialData);
		const isNewishUser = Date.now() - userData.createdAt.valueOf() < 1000 * 86400 * 30;
		const isThisUserAPartOfThisCOmmunity = await getCountOfPubsOrCollections(
			userData.id,
			initialData.communityData.id,
		);
		if (!isThisUserAPartOfThisCOmmunity) {
			return res.redirect(`https://www.pubpub.org/user/${userData.slug}`);
		}
		console.log(isThisUserAPartOfThisCOmmunity);
		return renderToNodeStream(
			res,
			<Html
				chunkName="User"
				initialData={initialData}
				viewData={{ userData }}
				headerComponents={generateMetaComponents({
					initialData,
					title: `${userData.fullName} · PubPub`,
					description: userData.bio,
					image: userData.avatar,
					canonicalUrl: `https://www.pubpub.org/user/${userData.slug}`,
					unlisted: isNewishUser,
				})}
			/>,
		);
	} catch (err) {
		return handleErrors(req, res, next)(err);
	}
});
