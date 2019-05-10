import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@blueprintjs/core';
import stickybits from 'stickybits';

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

const shouldUseSticky = (metaMode) => metaMode === 'history';

const PubMeta = (props) => {
	const { pubData, collabData, historyData, updateLocalData } = props;
	const { metaMode } = pubData;

	const stickyRef = useRef();

	useEffect(() => {
		const cleanup = () => {
			if (stickyRef.current) {
				stickyRef.current.cleanup();
			}
		};
		if (shouldUseSticky(metaMode)) {
			stickyRef.current = stickybits('.pub-meta-component', {
				stickyBitStickyOffset: 35,
				useStickyClasses: true,
			});
		} else if (stickyRef.current) {
			cleanup();
		}
		return cleanup;
	}, [metaMode]);

	if (!pubData.metaMode) {
		return null;
	}

	return (
		<div className="pub-meta-component">
			<GridWrapper containerClassName="pub">
				{shouldShowHeader(metaMode) && (
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
				{metaMode === 'details' && <Details pubData={pubData} />}
				{metaMode === 'metrics' && <Metrics pubData={pubData} />}
				{metaMode === 'social' && <Social pubData={pubData} />}
				{metaMode === 'download' && <Download pubData={pubData} />}
				{metaMode === 'history' && (
					<History
						pubData={pubData}
						collabData={collabData}
						updateLocalData={updateLocalData}
						historyData={historyData}
					/>
				)}
			</GridWrapper>
		</div>
	);
};

PubMeta.propTypes = propTypes;
export default PubMeta;
