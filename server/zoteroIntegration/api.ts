import app, { wrap } from 'server/server';

import { getZoteroIntegration } from './queries';

app.get(
	'/api/zoteroIntegration',
	wrap((req, res) =>
		getZoteroIntegration(req.user.id).then((integration) =>
			res.status(201).json({ id: integration.id }),
		),
	),
);
