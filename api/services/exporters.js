const Promise = require('bluebird');
const writeFile = Promise.promisify(require('fs').writeFile);
const pdf = require('html-pdf');
const fs = require('fs');
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {StyleRoot} from 'radium';
import AtomReaderHeader from 'containers/AtomReader/AtomReaderHeader';
import {renderReactFromJSON} from 'components/AtomTypes/Document/proseEditor/renderReactFromJSON';



export function generateMarkdownFile(markdown) {
	let folderName = '';
	const possible = 'abcdefghijklmnopqrstuvwxyz';
	for ( let charIndex = 0; charIndex < 8; charIndex++) { folderName += possible.charAt(Math.floor(Math.random() * possible.length)); }
	const filename = '/tmp/' + folderName + new Date().getTime() + '.md';

	return writeFile(filename, markdown)
	.then(function(result) {
		return filename;
	})
	.catch(function(error) {
		console.log('Error creating markdown file: ', error);
	});
}

export function generatePDFFromJSON(docJSON, title, versionDate, authors) {
	let folderName = '';
	const possible = 'abcdefghijklmnopqrstuvwxyz';
	for ( let charIndex = 0; charIndex < 8; charIndex++) { folderName += possible.charAt(Math.floor(Math.random() * possible.length)); }
	const filename = '/tmp/' + folderName + new Date().getTime() + '.pdf';

	
	const basePubCSS = fs.readFileSync(__dirname + '/../../static/css/basePub.css', 'utf8');
	const pubpubCSS = fs.readFileSync(__dirname + '/../../static/css/pubpub.css', 'utf8');
	const pubHTML = ReactDOMServer.renderToStaticMarkup(
		<StyleRoot radiumConfig={{userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'}}>
				<div className={'atom-reader atom-reader-meta'}>
					<AtomReaderHeader
						title={title}
						authors={authors}
						versionDate={String(versionDate)} 
						printMode={true} />

					{renderReactFromJSON(docJSON.content, true)}
				</div>	
		</StyleRoot>
	);

	const html = `
		<!doctype html>
		<html lang="en-us">
			<head>
				<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
				<link href='https://assets.pubpub.org/_fonts/Yrsa.css' rel='stylesheet' type='text/css'>
				<style> ${pubpubCSS} ${basePubCSS} body{font-size:10px;}</style>
			</head>

			<body>
				${pubHTML}
			</body>
		</html>
	`;

	const options = { 
		format: 'A4',
		border: '.5in',
		type: 'pdf', 
	};

	const createPDF = new Promise(function(resolve, reject) {
		pdf.create(html, options).toFile(filename, function(err, result) {
			if (err) { 
				reject('Error Creating Promise', err); 
			} else {
				resolve(filename);
			}
		});
	});
	
	return createPDF
	.then(function(result) {
		return filename;
	})
	.catch(function(error) {
		console.log('Error creating PDF file: ', error);
	});
}
