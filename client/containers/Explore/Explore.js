import React from 'react';
import PropTypes from 'prop-types';
import CommunityPreview from 'components/CommunityPreview/CommunityPreview';
import PageWrapper from 'components/PageWrapper/PageWrapper';
import { hydrateWrapper } from 'utilities';

require('./explore.scss');

const propTypes = {
	communityData: PropTypes.object.isRequired,
	loginData: PropTypes.object.isRequired,
	locationData: PropTypes.object.isRequired,
	exploreData: PropTypes.object.isRequired,
};

const Explore = (props) => {
	const exploreData = props.exploreData;

	return (
		<div id="explore-container">
			<PageWrapper
				loginData={props.loginData}
				communityData={props.communityData}
				locationData={props.locationData}
				hideNav={true}
			>
				<div className="container">
					<div className="row">
						<div className="col-12">
							<h1>Explore PubPub Communities</h1>
							<div className="details">
								Communities are groups focused on a particular topic, theme, or
								expertise. While their focus may be narrow, they invite perspective
								and contribution from all.
							</div>
						</div>

						{exploreData.activeCommunities
							.filter((item) => {
								return item;
							})
							.sort((foo, bar) => {
								if (foo.updatedAt < bar.updatedAt) {
									return 1;
								}
								if (foo.updatedAt > bar.updatedAt) {
									return -1;
								}
								return 0;
							})
							.map((item) => {
								return (
									<div className="col-4" key={`active-${item.id}`}>
										<CommunityPreview
											subdomain={item.subdomain}
											domain={item.domain}
											title={item.title}
											description={item.description}
											largeHeaderBackground={item.largeHeaderBackground}
											largeHeaderLogo={item.largeHeaderLogo}
											accentColor={item.accentColor}
											accentTextColor={item.accentTextColor}
										/>
									</div>
								);
							})}
					</div>
				</div>
			</PageWrapper>
		</div>
	);
};

Explore.propTypes = propTypes;
export default Explore;

hydrateWrapper(Explore);
