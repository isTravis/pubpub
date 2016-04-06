
 function generateHeaderString({markdown, title, abstract, authorsNote, authors}) {

	const headerMarkdown = `-----
${(authorsNote) ? `authorsNote: ${authorsNote}` : '' }
title: ${title}
${(abstract) ? `abstract: ${abstract}` : ''}
${authors.map((author) => {
	return `author: ${author.username}\n\tname: ${author.name}\n`;
}).join('')}
-----
`;

	const newMarkdown = headerMarkdown + markdown;
	return newMarkdown;
}


export function refactorTitleFirebase({pub, markdown, authors}) {

	let foundTitle = null;
	let foundAbstract = null;
	let foundAuthorsNote = null;
	let newMarkdown = markdown;

	const titleRegex = /\[\[title:(.*?)\]\]/gi;
	const abstractRegex = /\[\[abstract:(.*?)\]\]/gi;
	const authorsnoteRegex = /\[\[authorsNote:(.*?)\]\]/gi;


	const processTitle = function(match, p1) {
		foundTitle = p1;
		return '';
	};

	const processAbstract = function(match, p1) {
		foundAbstract = p1;
		return '';
	};

	const processAuthorsNote = function(match, p1) {
		foundAuthorsNote = p1;
		return '';
	};

	newMarkdown = newMarkdown.replace(titleRegex, processTitle);
	newMarkdown = newMarkdown.replace(abstractRegex, processAbstract);
	newMarkdown = newMarkdown.replace(authorsnoteRegex, processAuthorsNote);

	if (!foundTitle) {
		const hasTitleMigration = (markdown.indexOf('title:') !== -1);
    return markdown;
	}

	// console.log(foundTitle, foundAbstract, foundAuthorsNote);

	return generateHeaderString({markdown: newMarkdown, title: foundTitle, abstract: foundAbstract, authorsNote: foundAuthorsNote, authors});

}

export function refactorTitleMongo({pub, markdown, authors}) {
	return generateHeaderString({markdown, title: pub.title, abstract: pub.abstract, authorsNote: pub.authorsNote, authors});
}
