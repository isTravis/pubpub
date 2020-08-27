import {
	AnchorButton,
	Button,
	Callout,
	Checkbox,
	Classes,
	ControlGroup,
	Dialog,
	Icon,
	InputGroup,
} from '@blueprintjs/core';

import React, { useState } from 'react';
import TimeAgo from 'react-timeago';

import { pubUrl } from 'utils/canonicalUrls';
import { formatDate, timeAgoBaseProps } from 'utils/dates';
import { usePageContext } from 'utils/hooks';
import { apiFetch } from 'client/utils/apiFetch';
import { ClickToCopyButton, MinimalEditor } from 'components';

require('./pubReleaseDialog.scss');

type OwnProps = {
	historyData: {
		latestKey?: number;
	};
	isOpen: boolean;
	pubData: {
		id?: string;
		releases?: { createdAt: number }[];
	};
	onClose: (...args: any[]) => any;
	updatePubData: (...args: any[]) => any;
};

const defaultProps = {};

const createRelease = ({
	draftKey,
	pubId,
	communityId,
	noteContent,
	noteText,
	makeDraftDiscussionsPublic,
}) =>
	apiFetch('/api/releases', {
		method: 'POST',
		body: JSON.stringify({
			pubId: pubId,
			communityId: communityId,
			noteContent: noteContent,
			noteText: noteText,
			draftKey: draftKey,
			makeDraftDiscussionsPublic: makeDraftDiscussionsPublic,
		}),
	});

type Props = OwnProps & typeof defaultProps;

const PubReleaseDialog = (props: Props) => {
	const { isOpen, onClose, historyData, pubData, updatePubData } = props;
	const {
		communityData,
		scopeData: {
			activePermissions: { isSuperAdmin },
		},
	} = usePageContext();
	const [noteData, setNoteData] = useState({});
	const [makeDraftDiscussionsPublic, setMakeDraftDiscussionsPublic] = useState(false);
	const [isCreatingRelease, setIsCreatingRelease] = useState(false);
	const [createdRelease, setCreatedRelease] = useState(false);
	const [releaseError, setReleleaseError] = useState(null);
	const { releases } = pubData;
	const releaseCount = releases ? releases.length : 0;
	// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
	const latestRelease = releases[releaseCount - 1];

	const handleCreateRelease = async () => {
		setIsCreatingRelease(true);
		createRelease({
			communityId: communityData.id,
			pubId: pubData.id,
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'content' does not exist on type '{}'.
			noteContent: noteData.content,
			// @ts-expect-error ts-migrate(2339) FIXME: Property 'text' does not exist on type '{}'.
			noteText: noteData.text,
			draftKey: historyData.latestKey,
			makeDraftDiscussionsPublic: makeDraftDiscussionsPublic,
		})
			.then((release) => {
				setReleleaseError(null);
				setCreatedRelease(release);
				setIsCreatingRelease(false);
				updatePubData((currentPubData) => {
					return {
						releases: [...currentPubData.releases, release],
					};
				});
			})
			.catch((err) => {
				setReleleaseError(err);
				setIsCreatingRelease(false);
			});
	};

	const renderLatestReleaseInfo = (release) => {
		const releaseUrl = pubUrl(communityData, pubData, { releaseNumber: release.branchKey + 1 });

		return (
			<React.Fragment>
				<p>
					<Icon icon="history" iconSize={12} color="#888888" />{' '}
					{' The previous Release ('}
					<a href={releaseUrl} rel="noopener noreferrer" target="_blank">
						{'#' + releaseCount}
					</a>
					{') '}
					was created <TimeAgo {...timeAgoBaseProps} date={release.createdAt} />.
				</p>
				<p>
					You are about to create the next Release {'(#' + (releaseCount + 1) + ')'},
					making it the latest release of this Pub that readers will be shown by default.
				</p>
			</React.Fragment>
		);
	};

	const renderReleaseResult = () => {
		if (releaseError) {
			return <Callout intent="warning" title="There was an error creating this release." />;
		}
		if (createdRelease) {
			if (releases && releaseCount === 1) {
				const release = releases[releaseCount - 1];
				const dateString = formatDate(release.createdAt, {
					includeTime: true,
					includePreposition: true,
				});
				return (
					<React.Fragment>
						<Callout intent="success" title={'Created Release #1'} icon="tick-circle">
							<span className="release-date">{dateString}</span>
						</Callout>
						<p className="text-info">
							Congratulations! You have just created the first Release of this pub
							that is publicly viewable.
						</p>
						{renderURLForCopy(
							'Link that always points to the latest Release for this pub:',
							pubUrl(communityData, pubData),
						)}
					</React.Fragment>
				);
			}
			if (releases && releaseCount > 1) {
				const release = releases[releaseCount - 1];
				const dateString = formatDate(release.createdAt, {
					includeTime: true,
					includePreposition: true,
				});
				const releaseUrl = pubUrl(communityData, pubData, {
					releaseNumber: releaseCount,
				});
				return (
					<React.Fragment>
						<Callout
							intent="success"
							title={'Created Release #' + releaseCount}
							icon="tick-circle"
						>
							<span className="release-date">
								{dateString}. This is now the latest Release of this pub.
							</span>
						</Callout>
						{renderURLForCopy(
							'Link to access Release #' + releaseCount + ' specifically:',
							releaseUrl,
						)}
						{renderURLForCopy(
							'Link that always points to the latest Release for this pub:',
							pubUrl(communityData, pubData),
						)}
						<p className="text-info">
							Older Releases can be viewed using the{' '}
							<Icon icon="history" iconSize={12} color="#888888" /> History button in
							the Pub.
						</p>
					</React.Fragment>
				);
			}
		}
		return null;
	};

	const renderPreReleaseButtons = () => {
		return (
			<React.Fragment>
				<Button disabled={isCreatingRelease} onClick={onClose}>
					Return to Draft
				</Button>
				<Button loading={isCreatingRelease} intent="primary" onClick={handleCreateRelease}>
					{releases && releaseCount < 1
						? 'Create Release'
						: 'Create Release #' + (releaseCount + 1)}
				</Button>
			</React.Fragment>
		);
	};

	const renderPostReleaseButtons = () => {
		return (
			<React.Fragment>
				<Button onClick={onClose}>Return to Draft</Button>
				<AnchorButton intent="primary" href={pubUrl(communityData, pubData)}>
					{'Go to latest Release'}
				</AnchorButton>
			</React.Fragment>
		);
	};

	const renderURLForCopy = (label, url) => {
		return (
			<div>
				<p className="text-info">{label}</p>
				<ControlGroup className="url-select">
					<InputGroup className="display-url" value={url} fill small={true} />
					<ClickToCopyButton
						minimal={true}
						copyString={url}
						icon="duplicate"
						beforeCopyPrompt="Copy URL to clipboard"
						afterCopyPrompt="Copied URL!"
					></ClickToCopyButton>
				</ControlGroup>
			</div>
		);
	};

	return (
		<Dialog
			lazy={true}
			title="Publish"
			onClose={onClose}
			isOpen={isOpen}
			className="pub-release-dialog-component"
		>
			<div className={Classes.DIALOG_BODY}>
				{!createdRelease && (
					<React.Fragment>
						{releaseCount < 1 && (
							<p>
								To publish this pub, you can <i>create a Release</i> that will make
								the pub available at a publicly accessible URL.
							</p>
						)}
						{latestRelease && renderLatestReleaseInfo(latestRelease)}
						<p className="notes-header">
							<Icon icon="manually-entered-data" iconSize={12} />
							{'  '}Release Note
						</p>
						<MinimalEditor
							// @ts-expect-error ts-migrate(2322) FIXME: Type '(data: any) => void' is not assignable to ty... Remove this comment to see the full error message
							onChange={(data) => {
								setNoteData(data);
							}}
							focusOnLoad={true}
							// @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'undefined... Remove this comment to see the full error message
							placeholder="(optional) Add a note describing this new release.&#13;&#10;This will be included in the publicly-visible changelog of this pub."
						/>
						{isSuperAdmin && (
							<Checkbox
								checked={makeDraftDiscussionsPublic}
								onChange={() =>
									setMakeDraftDiscussionsPublic(!makeDraftDiscussionsPublic)
								}
								label="Make all discussions on the draft visible to the public"
							/>
						)}
					</React.Fragment>
				)}
				{renderReleaseResult()}
			</div>
			<div className={Classes.DIALOG_FOOTER}>
				<div className={Classes.DIALOG_FOOTER_ACTIONS}>
					{createdRelease && renderPostReleaseButtons()}
					{!createdRelease && renderPreReleaseButtons()}
				</div>
			</div>
		</Dialog>
	);
};
PubReleaseDialog.defaultProps = defaultProps;
export default PubReleaseDialog;
