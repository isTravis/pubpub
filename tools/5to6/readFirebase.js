const bigJson = require('big-json');
const storage = require('./storage');

const wd = storage('/Users/ian/Desktop/migration');
const parseStream = bigJson.createParseStream();
parseStream.on('data', (pubs) => {
	Object.keys(pubs).forEach((pubKey) => {
		const pubId = pubKey
			.split('-')
			.slice(1)
			.join('-');
		wd.within(`pubs/${pubId}`, (pubDir) => {
			pubDir.write('firebase-v5.json', JSON.stringify(pubs[pubKey]));
		});
	});
});
wd.readStream('firebase-v5.json').pipe(parseStream);
