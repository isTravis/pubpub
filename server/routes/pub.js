import React from 'react';
import Promise from 'bluebird';
import { Pub } from 'containers';
import Html from '../Html';
import app from '../server';
import {
	hostIsValid,
	renderToNodeStream,
	getInitialData,
	handleErrors,
	generateMetaComponents,
} from '../utils';
import { getFirebaseToken } from '../utils/firebaseAdmin';
import { findPub } from '../utils/pubQueries';

const getMode = (path, params) => {
	const { slug, reviewShortId } = params;
	if (path.indexOf(`/pub/${slug}/merge/`) > -1) {
		return 'merge';
	}
	if (path.indexOf(`/pub/${slug}/reviews/new`) > -1) {
		return 'reviewCreate';
	}
	if (path.indexOf(`/pub/${slug}/reviews/${reviewShortId}`) > -1) {
		return 'review';
	}
	if (path.indexOf(`/pub/${slug}/reviews`) > -1) {
		return 'reviews';
	}
	if (path.indexOf(`/pub/${slug}/manage`) > -1) {
		return 'manage';
	}
	if (path.indexOf(`/pub/${slug}/branch/new`) > -1) {
		return 'branchCreate';
	}
	return 'document';
};

app.get(
	[
		'/pub/:slug',
		'/pub/:slug/branch/new',
		'/pub/:slug/branch/:branchShortId',
		'/pub/:slug/branch/:branchShortId/:versionNumber',
		'/pub/:slug/merge/:fromBranchShortId/:toBranchShortId',
		'/pub/:slug/reviews/new/:fromBranchShortId/',
		'/pub/:slug/reviews/new/:fromBranchShortId/:toBranchShortId',
		'/pub/:slug/reviews',
		'/pub/:slug/reviews/:reviewShortId',
		'/pub/:slug/manage/',
		'/pub/:slug/manage/:manageMode',
	],
	(req, res, next) => {
		if (!hostIsValid(req, 'community')) {
			return next();
		}

		const mode = getMode(req.path, req.params);
		return getInitialData(req)
			.then((initialData) => {
				return Promise.all([
					initialData,
					findPub(req, initialData, mode),
					getFirebaseToken(initialData.loginData.id || 'anon', {}),
				]);
			})
			.then(([initialData, pubData, firebaseToken]) => {
				const newInitialData = {
					...initialData,
					pubData: {
						...pubData,
						firebaseToken: firebaseToken,
						mode: mode,
					},
				};
				let primaryCollection = false;
				pubData.collectionPubs.forEach((collection) => {
					if (collection.isPrimary && collection.collection.kind !== 'issue') {
						primaryCollection = collection.collection;
					}
				});
				const collectionTitle = primaryCollection.title || initialData.communityData.title;
				const pubTitle = `${pubData.title} · ${collectionTitle}`;
				return renderToNodeStream(
					res,
					<Html
						chunkName="Pub"
						initialData={newInitialData}
						headerComponents={generateMetaComponents({
							initialData: initialData,
							title: pubTitle,
							citationTitle: pubData.title,
							collectionTitle: collectionTitle,
							description: pubData.description,
							image: pubData.avatar,
							attributions: pubData.attributions,
							publishedAt: pubData.firstPublishedAt,
							doi: pubData.doi,
							//unlisted: isUnlistedDraft,
						})}
					>
						<Pub {...newInitialData} />
					</Html>,
				);
			})
			.catch(handleErrors(req, res, next));
	},
);
