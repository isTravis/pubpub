import React, { Dispatch, SetStateAction } from 'react';
import { Tab, Tabs, TabId, Icon, IconName, Button } from '@blueprintjs/core';

import { GridWrapper } from 'components';
import { Submission } from 'types';
import { usePendingChanges } from 'utils/hooks';

require('./spubHeaderToolbar.scss');

const renderTabTitle = (icon: IconName, title: string) => (
	<>
		<Icon icon={icon} /> {title}
	</>
);

type Props = {
	selectedTab: TabId;
	onSelectTab: Dispatch<SetStateAction<TabId>>;
	submission: Submission;
	showSubmitButton: boolean;
	onSubmit: () => any;
};

const SpubHeaderToolbar = (props: Props) => {
	const instructionTabTitle = renderTabTitle('align-left', 'Instructions');
	const submissionTabTitle = renderTabTitle('manually-entered-data', 'Submission');
	const contributorsTabTitle = renderTabTitle('people', 'Contributors');
	const previewTabTitle = renderTabTitle('eye-open', 'Preview');
	const maybeActiveClass = (tabId: string) =>
		`${tabId === props.selectedTab ? 'active' : 'inactive'}`;

	const { pendingCount } = usePendingChanges();
	const isSaving = pendingCount > 0;

	const status = isSaving ? (
		<strong>
			<em>Saving</em>
		</strong>
	) : (
		<p className="status-text">{props.submission.status}</p>
	);

	const renderRight = props.showSubmitButton ? (
		<Button className="submission-button" onSubmit={props.onSubmit}>
			Submit
		</Button>
	) : (
		<div className="status">
			<em>status:&nbsp;&nbsp;&nbsp;</em>
			<strong>{status}</strong>
		</div>
	);
	return (
		<GridWrapper>
			<div className="spubheader-toolbar">
				<div>
					<Tabs
						id="spubHeader"
						onChange={props.onSelectTab}
						selectedTabId={props.selectedTab}
						className="spub-header-component tabs bp3-large"
					>
						<Tab
							id="instructions"
							title={instructionTabTitle}
							className={`tab-panel ${maybeActiveClass('instructions')}`}
						/>

						<Tab
							id="submission"
							title={submissionTabTitle}
							className={`tab-panel ${maybeActiveClass('submission')}`}
						/>

						<Tab
							id="contributors"
							title={contributorsTabTitle}
							className={`tab-panel ${maybeActiveClass('contributors')}`}
						/>
						<Tab
							id="preview"
							title={previewTabTitle}
							className={`${maybeActiveClass('preview')}`}
						/>
					</Tabs>
				</div>
				<div>
					<div>{renderRight}</div>
				</div>
			</div>
		</GridWrapper>
	);
};

export default SpubHeaderToolbar;
