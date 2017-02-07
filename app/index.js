/* global Raven */
import React from 'react';
import ReactDOM from 'react-dom';
import ga from 'react-ga';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { Provider } from 'react-redux';
import routes from './Routes';
import configureStore from './configureStore';

import fetch from 'isomorphic-fetch';

const store = configureStore();
if (window.location.hostname !== 'localhost') {
	ga.initialize('UA-61723493-4');	
	Raven.config('https://e6c0bcc314e24746bff55ee2f73e505a@sentry.io/135645').install();
}


if (/PhantomJS/.test(window.navigator.userAgent)) { require('es6-promise').polyfill(); }

function logPageView() {
	ga.set({ page: window.location.pathname });
	ga.pageview(window.location.pathname);
}

global.clientFetch = function(route, opts) {
	return fetch(route, {
		...opts,
		credentials: 'same-origin'
	})
	.then((response)=> {
		if (!response.ok) { 
			return response.json().then(err => { throw err; });
		}
		return response.json();
	});
};

ReactDOM.render(
	<Provider store={store}>
		<Router 
			history={browserHistory} 
			routes={routes} 
			onUpdate={logPageView} 
			render={applyRouterMiddleware(useScroll((prevRouterProps, nextRouterProps) => {
				// Don't scroll if only the query is changing.
				if (prevRouterProps && prevRouterProps.location.pathname === nextRouterProps.location.pathname) {
					return false;
				}

				return true;
			}))} 
		/>
	</Provider>,
	document.getElementById('root')
);
