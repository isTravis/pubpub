import React from 'react';
import Raven from 'raven-js';
import { hydrate } from 'react-dom';
import { FocusStyleManager } from '@blueprintjs/core';

import { getClientInitialData } from './initialData';
import { setupKeen } from './keen';
import { setIsProd } from './isProd';

const isStorybookEnv = (windowObj) =>
	windowObj.location.origin === 'http://localhost:9001' || windowObj.STORYBOOK_ENV === 'react';

const isLocalEnv = (windowObj) => windowObj.location.origin.indexOf('localhost:') > -1;

export const hydrateWrapper = (Component) => {
	if (typeof window !== 'undefined' && !isStorybookEnv(window)) {
		FocusStyleManager.onlyShowFocusOnTabs();

		/* Remove any leftover service workers from last PubPub instance */
		if (window.navigator && navigator.serviceWorker) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				registrations.forEach((registration) => {
					registration.unregister();
				});
			});
		}

		const initialData = getClientInitialData();
		setIsProd(initialData.locationData.isPubPubProduction);

		if (!isLocalEnv(window)) {
			setupKeen();
			Raven.config('https://b4764efd07c240488d390c8343193208@sentry.io/197897').install();
			Raven.setUserContext({ username: initialData.loginData.slug });
		}

		hydrate(<Component {...initialData} />, document.getElementById('root'));
	}
};
