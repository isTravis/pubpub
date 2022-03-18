import React, { useMemo } from 'react';
import { Tab, Tabs, TabId, Icon, IconName, Button } from '@blueprintjs/core';
import Color from 'color';

import { GridWrapper } from 'components';
import { SubmissionStatus } from 'types';
import { usePageContext, usePendingChanges } from 'utils/hooks';

require('./spubHeaderToolbar.scss');

const renderTabTitle = (icon: IconName, title: string) => (
	<>
		<Icon icon={icon} iconSize={13} /> {title}
	</>
);

type Props = {
	selectedTab: TabId;
	onSelectTab: (t: TabId) => unknown;
	status: SubmissionStatus;
	showSubmitButton: boolean;
	onSubmit: () => any;
};

const SpubHeaderToolbar = (props: Props) => {
	const instructionTabTitle = renderTabTitle('align-left', 'Instructions');
	const submissionTabTitle = renderTabTitle('manually-entered-data', 'Submission');
	const contributorsTabTitle = renderTabTitle('people', 'Contributors');
	const previewTabTitle = renderTabTitle('eye-open', 'Preview');
	const { communityData } = usePageContext();

	const lighterAccentColor = useMemo(
		() => Color(communityData.accentColorLight).alpha(0.2),
		[communityData.accentColorLight],
	);

	const darkerAccentColor = useMemo(
		() => Color(communityData.accentColorDark),
		[communityData.accentColorDark],
	);
	const { pendingCount } = usePendingChanges();
	const isSaving = pendingCount > 0;

	const status = isSaving ? (
		<strong>
			<em>Saving</em>
		</strong>
	) : (
		<p className="status-text">{props.status}</p>
	);

	const renderRight = props.showSubmitButton ? (
		<Button className="submit-button" outlined={true} onClick={props.onSubmit}>
			Submit
		</Button>
	) : (
		<div className="status">
			<em>status:&nbsp;&nbsp;&nbsp;</em>
			<strong>{status}</strong>
		</div>
	);
	return (
		<div
			style={{ background: lighterAccentColor, color: darkerAccentColor }}
			className="spubheader-toolbar-component"
		>
			<GridWrapper containerClassName="toolbar-container">
				<div className="toolbar-items">
					<Tabs
						id="spubHeaderToolbar"
						onChange={props.onSelectTab}
						selectedTabId={props.selectedTab}
					>
						<Tab id="instructions" title={instructionTabTitle} />

						<Tab id="submission" title={submissionTabTitle} />

						<Tab id="contributors" title={contributorsTabTitle} />
						<Tab id="preview" title={previewTabTitle} />
					</Tabs>
					<div>{renderRight}</div>
				</div>
			</GridWrapper>
		</div>
	);
};

export default SpubHeaderToolbar;
