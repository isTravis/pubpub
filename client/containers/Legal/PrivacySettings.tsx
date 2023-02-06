import React, { useEffect, useState } from 'react';
import { AnchorButton, Button, Card, Switch } from '@blueprintjs/core';

import { apiFetch } from 'client/utils/apiFetch';
import { usePageContext } from 'utils/hooks';
import { Integration } from 'types';
import { getGdprConsentElection, updateGdprConsent } from 'client/utils/legal/gdprConsent';

type PrivacySettingsProps = {
	integrations: Integration[];
	isLoggedIn: boolean;
};

const deleteIntegration = (integrationId: string) =>
	apiFetch.delete('/api/integrations', { id: integrationId });

const exportEmailBody = `
Hello.
%0D%0A%0D%0A
I am writing to request an export of any PubPub account data associated with this email address.
`;

const deleteEmailBody = `
Hello.
%0D%0A%0D%0A
I am writing to request that the PubPub account associated with this email address, and all%20
data associated with that account, be deleted.
%0D%0A%0D%0A
I understand that this action may be irreversible.
`;

const ThirdPartyAnalyticsCard = () => {
	const { loginData } = usePageContext();
	const [hasUsedToggle, setHasUsedToggle] = useState(false);
	const [isEnabled, setIsEnabled] = useState(null);

	// We start with a null isEnabled value and only set it in a useEffect in order to avoid having
	// to check a cookie on the server side, which our SSR framework isn't set up to do.
	useEffect(() => {
		if (isEnabled === null) {
			// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'boolean' is not assignable to pa... Remove this comment to see the full error message
			setIsEnabled(!!getGdprConsentElection(loginData));
		}
		if (hasUsedToggle) {
			updateGdprConsent(loginData, isEnabled);
		}
	}, [hasUsedToggle, isEnabled, loginData]);

	return (
		<Card>
			<h5>Third-party analytics</h5>
			<p>
				PubPub uses a third-party analytics service called Heap to store, aggregate and
				summarize information about user behavior on our platform. We do this to help our
				engineering team make product decisions and communities who use our service to
				measure the performance of their content. We do not share any personally
				identifiable information with communities on PubPub or any other third parties. We
				pay Heap rather than using a more popular platform like Google Analytics, which is
				free but allows Google to process your data and re-sell it across the web.
			</p>
			<p>
				If you allow us to enable Heap while you browse, we'll send requests to their
				servers containing things like the URL of the current page, your browser version,
				and your IP address. If you're logged in, we'll also send your PubPub user ID, which
				is made of random letters and numbers. We'll never send Heap any identifying
				information such as your name, affiliation, or email address.
			</p>
			<Switch
				checked={!!isEnabled}
				onChange={() => {
					setHasUsedToggle(true);
					// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
					setIsEnabled(!isEnabled);
				}}
				label={'Third party analytics is ' + (isEnabled ? 'enabled' : 'disabled')}
			/>
		</Card>
	);
};

const PrivacySettings = (props: PrivacySettingsProps) => {
	const { isLoggedIn, integrations } = props;
	return (
		<div className="privacy-settings">
			<ThirdPartyAnalyticsCard />
			{isLoggedIn && (
				<React.Fragment>
					<Card>
						<h5>Data export</h5>
						<p>
							You can request an export of the data associated with your account on
							PubPub using the button below.
						</p>
						<AnchorButton
							target="_blank"
							href={`mailto:privacy@pubpub.org?subject=Account+data+export+request&body=${exportEmailBody.trim()}`}
						>
							Request data export
						</AnchorButton>
					</Card>
					{integrations.map((integration) => (
						<Card key={integration.id}>
							<h5>{integration.name} integration</h5>
							<p>
								Deleting the integration will purge your {integration.name}{' '}
								credentials from our database.
							</p>
							<Button
								intent="danger"
								text="Remove"
								onClick={() => deleteIntegration(integration.id)}
							/>
						</Card>
					))}
					<Card>
						<h5>Account deletion</h5>
						<p>
							You can request that we completely delete your PubPub account using the
							button below. If you have left comments on notable Pubs, we may reserve
							the right to continue to display them based on the academic research
							exception to GDPR.
						</p>
						<AnchorButton
							intent="danger"
							target="_blank"
							href={`mailto:privacy@pubpub.org?subject=Account+deletion+request&body=${deleteEmailBody.trim()}`}
						>
							Request account deletion
						</AnchorButton>
					</Card>
				</React.Fragment>
			)}
		</div>
	);
};
export default PrivacySettings;
