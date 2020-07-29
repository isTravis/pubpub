import contributors from './contributors';
import doiData from './doiData';
import relations from './relations';

export default ({ attributions, doi, language, resourceUrl, timestamp, title, relatedItems }) => {
	return {
		conference_paper: {
			'@language': language,
			...contributors(attributions),
			titles: {
				title: title,
			},
			...(relatedItems.length > 0 && relations(relatedItems)),
			...doiData(doi, timestamp, resourceUrl),
		},
	};
};
