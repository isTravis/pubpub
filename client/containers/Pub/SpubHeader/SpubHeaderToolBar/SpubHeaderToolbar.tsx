import React, { useMemo } from 'react';
import { Tab, Tabs, Icon, IconName, Button } from '@blueprintjs/core';
import Color from 'color';

import { GridWrapper } from 'components';
import { SubmissionStatus } from 'types';
import { usePageContext, usePendingChanges } from 'utils/hooks';
import { SpubHeaderTab } from '../SpubHeader';

require('./spubHeaderToolbar.scss');

const renderTabTitle = (icon: IconName, title: string) => (
	<>
		<Icon icon={icon} iconSize={13} /> {title}
	</>
);

type Props = {
	selectedTab: SpubHeaderTab;
	onSelectTab: (t: SpubHeaderTab) => unknown;
	status: SubmissionStatus;
	showSubmitButton: boolean;
	onSubmit: () => unknown;
};

const SpubHeaderToolbar = (props: Props) => {
	const instructionTabTitle = renderTabTitle('align-left', 'Instructions');
	const submissionTabTitle = renderTabTitle('manually-entered-data', 'Submission');
	const contributorsTabTitle = renderTabTitle('people', 'Contributors');
	const previewTabTitle = renderTabTitle('eye-open', 'Preview');
	const { communityData } = usePageContext();

	const lighterAccentColor = useMemo(
		() => Color(communityData.accentColorDark).alpha(0.1),
		[communityData.accentColorDark],
	);

	const { pendingCount } = usePendingChanges();
	const isSaving = pendingCount > 0;

	const status = isSaving ? (
		<strong>
			<em>Saving</em>
		</strong>
	) : (
		<span className="status-text">{props.status}</span>
	);

	const renderRight = () => {
		if (props.status !== 'incomplete')
			return (
				<div className="status">
					<em>status:&nbsp;&nbsp;&nbsp;</em>
					<strong>{status}</strong>
				</div>
			);
		if (props.showSubmitButton)
			return (
				<Button
					minimal
					outlined
					intent="primary"
					className="submit-button"
					onClick={props.onSubmit}
				>
					Submit
				</Button>
			);
		return null;
	};

	return (
		<div style={{ background: lighterAccentColor }} className="spub-header-toolbar-component">
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
					<div>{renderRight()}</div>
				</div>
			</GridWrapper>
		</div>
	);
};

export default SpubHeaderToolbar;
