import app from '../server';
import { getDoiData, setDoiData } from './handlers/doi';

// TODO(ian): add some kind of authentication here
app.get('/api/doi', (req, res) => {
	const { pubId, collectionId, communityId } = req.query;
	getDoiData({ communityId: communityId, collectionId: collectionId, pubId: pubId })
		.then((submission) => res.status(201).json(submission.json))
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

app.post('/api/doi', (req, res) => {
	const { pubId, collectionId, communityId } = req.body;
	return setDoiData({
		communityId: communityId,
		collectionId,
		pubId: pubId,
	})
		.then((json) => res.status(201).json(json))
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});
