import Cookies from 'js-cookie';
import type { InitialCommunityData, LoginData } from 'types';

import { apiFetch } from '../apiFetch';

import { getCookieOptions } from './cookieOptions';

const cookieKey = 'gdpr-consent';
const persistSignupCookieKey = 'gdpr-consent-survives-login';

const odiousCookies = ['heap'];
const deleteOdiousCookies = () => {
	// @ts-expect-error ts-migrate(2339) FIXME: Property 'heap' does not exist on type 'Window & t... Remove this comment to see the full error message
	window.heap?.resetIdentity();
	// @ts-expect-error ts-migrate(2339) FIXME: Property 'heap' does not exist on type 'Window & t... Remove this comment to see the full error message
	window.heap?.clearEventProperties();
	odiousCookies.map((key) => Cookies.remove(key, { path: '' }));
};

export const gdprCookiePersistsSignup = () => Cookies.get(persistSignupCookieKey) === 'yes';

export const getGdprConsentElection = (loginData: LoginData | null = null) => {
	const cookieValue = Cookies.get(cookieKey);
	if (loginData && loginData.id && loginData.gdprConsent !== null) {
		// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
		return loginData.gdprConsent === true;
	}
	if (cookieValue) {
		return cookieValue === 'accept';
	}
	return null;
};

export const shouldShowGdprBanner = ({
	loginData,
	communityData: { analyticsSettings },
}: {
	loginData: LoginData;
	communityData: InitialCommunityData;
}) => {
	// the first check is mostly to safeguard against bad data in the db, should be 'default' by default
	if (!analyticsSettings?.type || analyticsSettings.type === 'default') {
		return false;
	}

	if (loginData.id && loginData.gdprConsent === null) {
		return true;
	}
	return getGdprConsentElection(loginData) === null;
};

export const updateGdprConsent = (loginData, doesUserConsent) => {
	const loggedIn = !!loginData.id;
	const cookieOptions = getCookieOptions();
	Cookies.set(cookieKey, doesUserConsent ? 'accept' : 'decline', cookieOptions);
	Cookies.set(persistSignupCookieKey, 'yes', cookieOptions);
	if (!doesUserConsent) {
		if (!loggedIn) {
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'heap' does not exist on type 'Window & t... Remove this comment to see the full error message
			window.heap?.identify(Math.random());
		}
		deleteOdiousCookies();
	}
	if (loggedIn) {
		return apiFetch('/api/users', {
			method: 'PUT',
			body: JSON.stringify({
				userId: loginData.id,
				gdprConsent: doesUserConsent,
			}),
		});
	}
	return Promise.resolve();
};
