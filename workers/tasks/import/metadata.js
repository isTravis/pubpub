import { metaValueToString } from '@pubpub/prosemirror-pandoc';

import { getSearchUsers } from '../../../server/search/queries';

export const getProposedMetadata = async (meta) => {
	const { title, subtitle, author } = meta;
	const proposedMetadata = {};
	if (title) {
		proposedMetadata.title = metaValueToString(title);
	}
	if (subtitle) {
		proposedMetadata.description = metaValueToString(subtitle);
	}
	if (author && Array.isArray(author.content)) {
		const authorNames = author.content.map(metaValueToString);
		const authors = await Promise.all(
			authorNames.map(async (authorName) => {
				const users = await getSearchUsers(authorName);
				return { name: authorName, users: users.map((user) => user.toJSON()) };
			}),
		);
		proposedMetadata.authors = authors;
	}
	return proposedMetadata;
};
