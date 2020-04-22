import React from 'react';
import PropTypes from 'prop-types';

let manifest;
try {
	/* eslint-disable-next-line global-require, import/no-unresolved */
	manifest = require('../dist/manifest.json');
} catch (err) {
	// No Manifest file. Must be dev mode.
}

const propTypes = {
	children: PropTypes.node.isRequired,
	chunkName: PropTypes.string.isRequired,
	initialData: PropTypes.object.isRequired,
	headerComponents: PropTypes.array.isRequired,
};

const polyfills = [
	'default',
	'fetch',
	'HTMLCanvasElement.prototype.toBlob',
	'Node.prototype.contains',
	'Number.isNaN',
	'Object.assign',
	'Object.entries',
	'Object.values',
	'Promise',
	'requestIdleCallback',
	'String.prototype.includes',
	'URL',
].join(',');

const Html = (props) => {
	const getPath = (chunkName, extension) => {
		let manifestUrl = manifest
			? `${manifest[`${chunkName}.${extension}`]}`
			: `${chunkName}.${extension}`;

		/* If we're on a hosted dev server, remove the static path */
		/* Note that fonts will still be sourced from static.pubpub */
		/* so if viewing those needs to be tested, the webpack config */
		/* needs to change. */

		/* TODO: Uncomment when v6 is live */
		// if (!props.initialData.locationData.isPubPubProduction) {
		manifestUrl = manifestUrl.replace('https://static.pubpub.org', '');
		// }

		return manifestUrl;
	};

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				{props.headerComponents}
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta
					name="google-site-verification"
					content="jmmJFnkSOeIEuS54adOzGMwc0kwpsa8wQ-L4GyPpPDg"
				/>
				<link rel="stylesheet" type="text/css" href={getPath('baseStyle', 'css')} />
				<link rel="stylesheet" type="text/css" href={getPath('vendor', 'css')} />
				<link rel="stylesheet" type="text/css" href={getPath(props.chunkName, 'css')} />
				<link
					rel="search"
					type="application/opensearchdescription+xml"
					title={props.initialData.communityData.title}
					href="/opensearch.xml"
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
	  heap.load("3777990325");`,
					}}
				/>
			</head>
			<body>
				<div id="root">{props.children}</div>
				<script
					crossOrigin="anonymous"
					src={`https://polyfill.io/v3/polyfill.min.js?features=${polyfills}`}
				/>
				<script
					id="initial-data"
					type="text/plain"
					data-json={JSON.stringify(props.initialData)}
				/>
				<script src={getPath('vendor', 'js')} />
				<script src={getPath(props.chunkName, 'js')} />
			</body>
		</html>
	);
};

Html.propTypes = propTypes;
export default Html;
