export default {
	iconLinks: [
		{ title: 'Search', url: '/search' },
		{ title: 'Alerts', url: '/content-alerts' },
		{ title: 'Submit your research', url: '/submit-your-research' },
	],
	logo: {
		titleText: 'eLife home page',
		url: '/',
		sourceProps: {
			srcSet: 'https://assets.pubpub.org/pm5kgkt7/41674145834317.svg',
			type: 'image/svg+xml',
		},
		imgProps: {
			src: 'https://assets.pubpub.org/pm5kgkt7/41674145834317.svg',
			alt: 'eLife logo',
		},
	},
	bannerNavItems: [
		{ url: '', title: 'Menu' },
		{ url: '/', title: 'Home' },
		{ url: '/magazine', title: 'Magazine' },
		{ url: '/community', title: 'Community' },
		{ url: '/about', title: 'About' },
	],
	navItemGroups: [
		[
			{ isMobileOnly: true, url: '/', title: 'Home' },
			{ isMobileOnly: true, url: '/magazine', title: 'Magazine' },
			{ isMobileOnly: true, url: '/community', title: 'Community' },
			{ isMobileOnly: true, url: '/about', title: 'About' },
			{ isMobileOnly: false, url: '/subjects', title: 'Research categories' },
			{ isMobileOnly: false, url: '/inside-elife', title: 'Inside eLife' },
		],
		[
			{ isMobileOnly: true, url: '/search', title: 'Search' },
			{ isMobileOnly: true, url: '/content-alerts', title: 'Subscribe to alerts' },
		],
		[
			{
				isMobileOnly: true,
				url: 'https://elifesciences.org/submit-your-research',
				title: 'Submit your research',
			},
			{
				isMobileOnly: false,
				url: 'https://reviewer.elifesciences.org/author-guide/editorial-process',
				title: 'Author guide',
			},
			{
				isMobileOnly: false,
				url: 'https://reviewer.elifesciences.org/reviewer-guide/review-process',
				title: 'Reviewer guide',
			},
		],
	],
	twitterUrl: '',
};
