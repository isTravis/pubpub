import { FacetValue, License } from 'facets';
import * as types from 'types';
import { getPrimaryCollection } from 'utils/collections/primary';
import { getLocalDateMatchingUtcCalendarDate, isValidDate } from 'utils/dates';
import { CollectionPub, Pub } from 'server/models';
import { getPubPublishedDate } from './pubDates';

type GetPubCopyrightOptions = {
	license: FacetValue<typeof License>;
	collectionPubs:
		| types.DefinitelyHas<types.CollectionPub, 'collection'>[]
		| types.DefinitelyHas<CollectionPub, 'collection'>[];
	pub: types.Pub | Pub;
};

type PubCopyrightSource =
	| 'license-facet'
	| 'primary-collection-metadata'
	| 'published-date'
	| 'current-year';

type PubCopyrightResult =
	| {
			hasCopyright: true;
			source: PubCopyrightSource;
			year: number;
	  }
	| { hasCopyright: false; year: null };

export const getPubCopyrightYear = (options: GetPubCopyrightOptions): PubCopyrightResult => {
	const { license, collectionPubs, pub } = options;
	if (license.kind !== 'copyright') {
		return {
			hasCopyright: false,
			year: null,
		};
	}
	if (license.copyrightSelection?.choice === 'choose-here' && license.copyrightSelection?.year) {
		return {
			hasCopyright: true,
			source: 'license-facet',
			year: license.copyrightSelection.year,
		};
	}
	const primaryCollection = getPrimaryCollection(collectionPubs);
	if (primaryCollection) {
		const { metadata } = primaryCollection;
		if (metadata) {
			const { copyrightYear, date, publicationDate } = metadata;
			const dateSource = copyrightYear || date || publicationDate;
			if (dateSource && isValidDate(dateSource)) {
				const localDate = getLocalDateMatchingUtcCalendarDate(dateSource);
				return {
					hasCopyright: true,
					source: 'primary-collection-metadata',
					year: localDate.getFullYear(),
				};
			}
		}
	}
	const pubPublishedDate = getPubPublishedDate(pub);
	if (pubPublishedDate) {
		return {
			hasCopyright: true,
			source: 'published-date',
			year: pubPublishedDate.getFullYear(),
		};
	}
	return {
		hasCopyright: true,
		source: 'current-year',
		year: new Date().getFullYear(),
	};
};
