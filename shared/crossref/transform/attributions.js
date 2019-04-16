import ensureUserForAttribution from 'shared/utils/ensureUserForAttribution';

export default (attributions) => {
	return attributions.map(ensureUserForAttribution).sort((a, b) => a.order - b.order);
};
