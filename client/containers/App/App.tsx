import React, { ReactNode } from 'react';
import { Provider as RKProvider } from 'reakit';
import classNames from 'classnames';

import {
	Header,
	LegalBanner,
	AccentStyle,
	NavBar,
	SkipLink,
	Footer,
	MobileAware,
	FacetsStateProvider,
} from 'components';
import { PageContext } from 'utils/hooks';
import { hydrateWrapper } from 'client/utils/hydrateWrapper';
import {
	MinimalHeader,
	minimalHeaderData,
	TwoColumnFooter,
	twoColumnFooterData,
	MinimalFooter,
	minimalFooterData,
	CollapsibleHeader,
	collapsibleHeaderData,
} from 'client/layouts';

import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';
import BottomMenu from './BottomMenu';
import SpamBanner from './SpamBanner';

import getPaths from './paths';
import { usePageState } from './usePageState';

require('../../styles/base.scss');
require('./app.scss');

type Props = {
	chunkName: string;
	initialData: any;
	viewData: any;
};

const App = (props: Props) => {
	const { chunkName, initialData, viewData } = props;
	const pageContextProps = usePageState(initialData, viewData);
	const { communityData, locationData, scopeData, loginData, featureFlags } = pageContextProps;

	const pathObject = getPaths(viewData, locationData, chunkName);
	const { ActiveComponent, hideNav, hideFooter, hideHeader, isDashboard } = pathObject;

	// Our debugging lifeline
	if (typeof window !== 'undefined') {
		// @ts-expect-error ts-migrate(2339) FIXME: Property '__pubpub_pageContextProps__' does not ex... Remove this comment to see the full error message
		window.__pubpub_pageContextProps__ = pageContextProps;
	}

	const usingMinimalHeader = featureFlags['minimal-header'];
	const usingMinimalFooter = featureFlags['minimal-footer'];
	const usingTwoColumnFooter = featureFlags['two-column-footer'];
	const usingCollapsibleHeader = featureFlags['collapsible-header'];

	const showNav = !hideNav && !communityData.hideNav && !isDashboard && !usingMinimalHeader;
	const showFooter = !hideFooter && !isDashboard;
	const showHeader = !hideHeader;

	let header: ReactNode;
	let footer: ReactNode;

	if (usingMinimalHeader && !isDashboard) {
		header = (
			<MinimalHeader
				{...minimalHeaderData}
				locationData={locationData}
				loginData={loginData}
			/>
		);
	} else if (usingCollapsibleHeader && !isDashboard) {
		header = <CollapsibleHeader {...collapsibleHeaderData} />;
	} else {
		header = <Header />;
	}

	if (usingMinimalFooter && !isDashboard) {
		footer = <MinimalFooter {...minimalFooterData} communityData={communityData} />;
	} else if (usingTwoColumnFooter && !isDashboard) {
		footer = <TwoColumnFooter {...twoColumnFooterData} />;
	} else {
		footer = <Footer />;
	}

	return (
		<PageContext.Provider value={pageContextProps}>
			<FacetsStateProvider
				options={{ currentScope: scopeData.scope, cascadeResults: scopeData.facets }}
			>
				<RKProvider>
					<div id="app" className={classNames({ dashboard: isDashboard })}>
						{communityData.spamTag?.status === 'confirmed-spam' && <SpamBanner />}
						<AccentStyle communityData={communityData} isNavHidden={!showNav} />
						{(locationData.isDuqDuq || locationData.isQubQub) && (
							<div className="duqduq-warning">Development Environment</div>
						)}
						<SkipLink targetId="main-content">Skip to main content</SkipLink>
						<LegalBanner />
						{showHeader && header}
						{showNav && <NavBar />}
						{isDashboard && (
							<MobileAware
								mobile={({ className }) => (
									<BottomMenu isMobile className={className} />
								)}
								desktop={({ className }) => (
									<>
										<SideMenu className={className} />
										<Breadcrumbs className={className} />
									</>
								)}
							/>
						)}
						<div id="main-content" tabIndex={-1}>
							<ActiveComponent {...viewData} />
						</div>
						{showFooter && footer}
					</div>
				</RKProvider>
			</FacetsStateProvider>
		</PageContext.Provider>
	);
};
export default App;

hydrateWrapper(App);
