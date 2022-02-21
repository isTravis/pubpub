import React from 'react';
import { Button } from '@blueprintjs/core';

import { PubPageData, DefinitelyHas } from 'types';

import { usePageContext } from 'utils/hooks';
import { PubThemePicker, PopoverButton, DownloadChooser } from 'components';

require('./spubSettings.scss');

type Props = {
	pubData: DefinitelyHas<PubPageData, 'submission'>;
	onUpdatePub: (pub: Partial<PubPageData>) => unknown;
};

const SpubSettings = (props: Props) => {
	const { onUpdatePub, pubData } = props;
	const { communityData } = usePageContext();

	const renderHeaderAndBackgroundSetting = () => {
		return (
			<div className="submission-tab-prompt">
				<div>
					<h4>Header Background & Theme</h4>
					<p className="submission-tab-prompt-text">
						You can pick a background image and a custom visual theme for the header of
						your submission pub.
						<br />
						<br />
						Once you've made your changes, use the Preview tab to see the updated header
						of your submission pub.
					</p>
				</div>
				<div>
					EDIT PUB THEME &nbsp;
					<PopoverButton
						component={PubThemePicker}
						className="pub-header-popover"
						updatePubData={onUpdatePub}
						pubData={pubData}
						communityData={communityData}
						aria-label="Pub header theme options"
					>
						<Button icon="clean" />
					</PopoverButton>
				</div>
			</div>
		);
	};

	const renderDefaultDownloadFile = () => {
		return (
			<div className="submission-tab-prompt">
				<div>
					<h4>Default Download File</h4>
					<p className="submission-tab-prompt-text">
						Readers of your submission pub can choose to download it as a file,
						available in different formats automatically generated by PubPub.
						<br />
						<br />
						You can upload a file, like a PDF with custom styling, to associate with
						your pub. It will be provided to readers as the pub's default download, but
						they'll still be able to use the automatic export tools.
					</p>
				</div>
				<div>
					<DownloadChooser
						pubData={pubData}
						communityId={communityData.id}
						onSetDownloads={onUpdatePub}
						copy="Upload Your file"
					/>
				</div>
			</div>
		);
	};

	return (
		<div className="submission-tab-tabs">
			{renderHeaderAndBackgroundSetting()}
			{renderDefaultDownloadFile()}
		</div>
	);
};

export default SpubSettings;
