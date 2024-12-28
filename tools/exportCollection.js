/* eslint-disable no-console */
import fs from 'fs';
import fetch from 'node-fetch';

import { Collection, CollectionPub } from 'server/models';
import { getBestDownloadUrl } from 'utils/pub/downloads';
import { createPubExportsForLatestRelease } from 'server/export/queries';
import { getPubData } from 'server/rss/queries';

import { promptOkay } from './utils/prompt';
import { asyncMap } from '../utils/async';

/* Usage: npm run tools exportCollection -- --collectionId=collectionId */

/* Warning: your IP may get blocked by Cloudflare, leading to bad PDF/XML
streams. The patch is to add your IP in cloudflare's IP list */

const {
	argv: { collectionId },
} = require('yargs');

const getPubExports = async (pubId, dest) => {
	const [pubData] = await getPubData([pubId]);
	if (!pubData.releases || pubData.releases.length < 1) {
		return Promise.resolve();
	}
	const pdfUrl = getBestDownloadUrl(pubData, 'pdf');
	const jatsUrl = getBestDownloadUrl(pubData, 'jats');
	const finalDest = `${dest}/${pubData.slug}`;
	const promises = [];
	if (!pdfUrl || !jatsUrl) {
		console.log('Missing:', pubData.slug);
		promises.push(createPubExportsForLatestRelease(pubId));
		promises.push(getPubExports(pubId, dest));
		console.log('resolve recursive call', promises);
		return Promise.all(promises);
	}
	// Make the empty dir
	fs.mkdirSync(finalDest);
	try {
		const jats = await fetch(jatsUrl);
		console.log('getting JATS...', jatsUrl);
		jats.body.pipe(fs.createWriteStream(`${finalDest}/${pubData.slug}.xml`));
		const pdf = await fetch(pdfUrl);
		console.log('getting PDF...', pdfUrl);
		pdf.body.pipe(fs.createWriteStream(`${finalDest}/${pubData.slug}.pdf`));
		console.log('resolving promise...');
		return Promise.resolve();
	} catch (error) {
		throw new Error(error);
	}
};

const main = async () => {
	const query = {
		include: [
			{
				model: CollectionPub,
				as: 'collectionPubs',
				attributes: ['pubId'],
			},
		],
		where: { id: collectionId },
	};
	try {
		const collection = await Collection.findOne(query);
		await promptOkay(`Export ${collection.collectionPubs.length} pubs?`, {
			yesIsDefault: false,
			throwIfNo: true,
		});
		const dest = `/tmp/${collection.slug}`;
		if (fs.existsSync(dest)) {
			fs.rmdirSync(dest, { recursive: true });
		}
		fs.mkdirSync(dest);
		await asyncMap(
			collection.collectionPubs,
			(collectionPub) => getPubExports(collectionPub.pubId, dest),
			{ concurrency: 5 },
		);
	} catch (err) {
		console.warn(err);
	}
};

main().finally(() => process.exit(0));
