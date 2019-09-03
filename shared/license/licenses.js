export const licenses = [
	{
		slug: 'cc-by',
		full: 'Creative Commons Attribution 4.0 International License',
		short: 'CC-BY',
		version: '4.0',
		link: 'https://creativecommons.org/licenses/by/4.0/',
	},
	{
		slug: 'cc-0',
		full: 'Creative Commons Public Domain Dedication',
		short: 'CC-0 4.0',
		version: '4.0',
		link: 'https://creativecommons.org/publicdomain/zero/1.0/',
	},
	{
		slug: 'cc-by-nc',
		full: 'Creative Commons Attribution-NonCommercial 4.0 International License',
		short: 'CC-BY-NC 4.0',
		version: '4.0',
		link: 'https://creativecommons.org/licenses/by-nc/4.0/',
	},
	{
		slug: 'cc-by-nd',
		full: 'Creative Commons Attribution-NoDerivatives 4.0 International License',
		short: 'CC-BY-ND',
		version: '4.0',
		link: 'https://creativecommons.org/licenses/by-nd/4.0/',
	},
	{
		slug: 'cc-by-nc-nd',
		full: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License',
		short: 'CC-BY-NC-ND',
		version: '4.0',
		link: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
	},
];

export const getLicenseBySlug = (slug) => {
	return licenses.find((ls) => ls.slug === slug);
};
