import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@blueprintjs/core';
import GridWrapper from 'components/GridWrapper/GridWrapper';
import { pubDataProps } from 'types/pub';
import Details from './Details';
import Download from './Download';
import History from './History';
import Metrics from './Metrics';
import Social from './Social';

require('./pubMeta.scss');

const propTypes = {
	pubData: pubDataProps.isRequired,
	updateLocalData: PropTypes.func.isRequired,
};

const shouldShowHeader = (metaMode) => metaMode !== 'history';

const PubMeta = (props) => {
	const { pubData, collabData, updateLocalData } = props;

	if (!pubData.metaMode) {
		return null;
	}
	return (
		<div className="pub-meta-component">
			<GridWrapper containerClassName="pub">
				{shouldShowHeader(pubData.metaMode) && (
					<div className="header">
						<Button
							icon="small-cross"
							minimal={true}
							small={true}
							className="meta-close"
							onClick={() => {
								updateLocalData('pub', {
									metaMode: undefined,
								});
							}}
						/>
					</div>
				)}
				{pubData.metaMode === 'details' && <Details pubData={pubData} />}
				{pubData.metaMode === 'metrics' && <Metrics pubData={pubData} />}
				{pubData.metaMode === 'social' && <Social pubData={pubData} />}
				{pubData.metaMode === 'download' && <Download pubData={pubData} />}
				{pubData.metaMode === 'history' && (
					<History
						pubData={pubData}
						collabData={collabData}
						updateLocalData={updateLocalData}
					/>
				)}
			</GridWrapper>
		</div>
	);
};

PubMeta.propTypes = propTypes;
export default PubMeta;
