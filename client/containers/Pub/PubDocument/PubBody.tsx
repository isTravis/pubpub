import React, { useRef, useContext, useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useBeforeUnload } from 'react-use';
import * as Sentry from '@sentry/browser';
import { Card, Alert } from '@blueprintjs/core';
import TimeAgo from 'react-timeago';
import { saveAs } from 'file-saver';
import { debounce } from 'debounce';

import Editor, { getJSON } from 'components/Editor';
import { usePageContext } from 'utils/hooks';

import { usePubContext } from '../pubHooks';
import { usePubBodyState } from './usePubBodyState';
import { PubSuspendWhileTypingContext } from '../PubSuspendWhileTyping';
import discussionSchema from './DiscussionAddon/discussionSchema';
import Discussion from './PubDiscussions/Discussion';

require('./pubBody.scss');

type Props = {
	editorWrapperRef: React.Ref<HTMLDivElement>;
};

let setSavingTimeout;

const shouldSuppressEditorErrors = () => {
	if (window && 'URLSearchParams' in window) {
		const urlParams = new URLSearchParams(window.location.search);
		return !!urlParams.get('suppressEditorErrors');
	}
	return false;
};

const PubBody = (props: Props) => {
	const { editorWrapperRef } = props;
	const { communityData } = usePageContext();
	const { pubData, noteManager, updateLocalData, collabData, firebaseDraftRef, historyData } =
		usePubContext();
	const { isViewingHistory } = historyData;
	const prevStatusRef = useRef<string | null>(null);
	const embedDiscussions = useRef({});
	const [editorError, setEditorError] = useState<Error | null>(null);
	const [editorErrorTime, setEditorErrorTime] = useState<number | null>(null);
	const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
	const { key, initialContent, isReadOnly, includeCollabPlugin } = usePubBodyState();

	prevStatusRef.current = collabData.status;
	useBeforeUnload(
		(collabData.status === 'saving' || collabData.status === 'disconnected') && !editorError,
		'Your pub has not finished saving. Are you sure you wish to leave?',
	);

	const downloadBackup = () => {
		const docJson = getJSON(collabData.editorChangeObject!.view);
		const blob = new Blob([JSON.stringify(docJson, null, 2)], {
			type: 'text/plain;charset=utf-8',
		});
		saveAs(blob, `${pubData.title}_backup.json`);
	};

	const getNextStatus = (status, onComplete) => {
		clearTimeout(setSavingTimeout);
		const prevStatus = prevStatusRef.current;
		const nextStatus = { status };

		/* If loading, wait until 'connected' */
		if (prevStatus === 'connecting' && status === 'connected') {
			onComplete(nextStatus);
		}

		if (prevStatus !== 'connecting' && prevStatus !== 'disconnected') {
			if (status === 'saving') {
				setSavingTimeout = setTimeout(() => {
					onComplete(nextStatus);
				}, 250);
			} else {
				onComplete(nextStatus);
				setLastSavedTime(Date.now());
			}
		}

		/* If disconnected, only set state if the new status is 'connected' */
		if (prevStatus === 'disconnected' && status === 'connected') {
			onComplete(nextStatus);
		}
	};

	const { markLastInput } = useContext(PubSuspendWhileTypingContext);
	// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
	const showErrorTime = lastSavedTime && editorErrorTime - lastSavedTime > 500;
	const discussionAnchors = useMemo(() => {
		if (pubData.isRelease) {
			return pubData.discussions
				.map((discussion) =>
					discussion.anchors!.filter(
						(anchor) => anchor.historyKey === historyData.currentKey,
					),
				)
				.reduce((a, b) => [...a, ...b], []);
		}
		return [];
	}, [pubData.discussions, pubData.isRelease, historyData.currentKey]);

	const handleKeyPress = useCallback(() => {
		markLastInput();
		return false;
	}, [markLastInput]);

	const handleError = useCallback((err) => {
		setEditorError(err);
		setEditorErrorTime(Date.now());
		if (typeof window !== 'undefined' && (window as any).sentryIsActive) {
			Sentry.configureScope((scope) => {
				scope.setTag('error_source', 'editor');
			});
			Sentry.captureException(err);
		}
	}, []);

	return (
		<main className="pub-body-component" ref={editorWrapperRef}>
			<style>
				{`
					.editor.ProseMirror h1#abstract:first-child {
						color: ${communityData.accentColorDark};
					}
				`}
			</style>
			<Editor
				key={key}
				customNodes={
					{
						...discussionSchema,
					} as any
				}
				nodeOptions={{
					discussion: {
						addRef: (embedId, mountRef, threadNumber) => {
							embedDiscussions.current[embedId] = {
								mountRef,
								threadNumber,
							};
						},
						removeRef: (embedId) => {
							delete embedDiscussions.current[embedId];
						},
					},
				}}
				enableSuggestions
				nodeLabels={pubData.nodeLabels}
				noteManager={noteManager}
				placeholder={pubData.isReadOnly ? undefined : 'Begin writing here...'}
				initialContent={initialContent}
				isReadOnly={isReadOnly}
				onKeyPress={handleKeyPress}
				onChange={(editorChangeObject) => {
					updateLocalData('collab', { editorChangeObject });
				}}
				onError={handleError}
				discussionsOptions={
					!isViewingHistory && {
						draftRef: firebaseDraftRef,
						initialHistoryKey: pubData.initialDocKey,
						discussionAnchors,
					}
				}
				collaborativeOptions={
					includeCollabPlugin && firebaseDraftRef
						? {
								firebaseRef: firebaseDraftRef,
								clientData: {
									...collabData.localCollabUser,
									id: collabData.localCollabUser.id + '_' + key,
								},
								initialDocKey: pubData.initialDocKey,
								onStatusChange: debounce((status) => {
									getNextStatus(status, (nextStatus) => {
										updateLocalData('collab', nextStatus);
									});
								}, 250),
								onUpdateLatestKey: (latestKey) => {
									updateLocalData('history', {
										latestKey,
										currentKey: latestKey,
									});
								},
						  }
						: undefined
				}
			/>
			{!!editorError && !shouldSuppressEditorErrors() && (
				<Alert
					// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type 'boolean | u... Remove this comment to see the full error message
					isOpen={editorError}
					icon="error"
					confirmButtonText="Refresh Page"
					onConfirm={() => {
						window.location.reload();
					}}
					cancelButtonText={showErrorTime ? 'Download backup' : undefined}
					onCancel={showErrorTime ? downloadBackup : undefined}
					className="pub-body-alert"
				>
					<h5>An error has occured in the editor.</h5>
					<p>We've logged the error and will look into the cause right away.</p>
					{showErrorTime && (
						<React.Fragment>
							<p className="error-time">
								Your changes were last saved{' '}
								<TimeAgo
									formatter={(value, unit, suffix) => {
										const unitSuffix = value === 1 ? '' : 's';
										return `${value} ${unit}${unitSuffix} ${suffix}`;
									}}
									date={lastSavedTime}
									now={() => editorErrorTime}
								/>
								.
							</p>
							<p>
								If you are concerned about unsaved changes being lost, please
								download a backup copy of your document below.
							</p>
						</React.Fragment>
					)}
					{!showErrorTime && (
						<p className="error-time">
							All previous changes have been successfully saved.
						</p>
					)}
					<p>To continue editing, please refresh the page.</p>
				</Alert>
			)}
			{/* For now, we have PubBody mount Portals for embedded Discussions */}
			{Object.keys(embedDiscussions.current).map((embedId) => {
				const mountRef = embedDiscussions.current[embedId].mountRef;
				if (!mountRef.current) {
					return null;
				}

				const number = embedDiscussions.current[embedId].number;
				// const threads = nestDiscussionsToThreads(pubData.discussions);
				// const threads = pubData.discussions;
				const activeDiscussion = pubData.discussions.find((disc) => disc.number === number);

				return ReactDOM.createPortal(
					<React.Fragment>
						{!activeDiscussion && (
							<Card>Please select a discussion from the formatting bar.</Card>
						)}
						{activeDiscussion && (
							<Discussion
								key={embedId}
								pubData={pubData}
								discussionData={activeDiscussion}
								updateLocalData={updateLocalData}
								canPreview={true}
							/>
						)}
					</React.Fragment>,
					mountRef.current,
				);
			})}
		</main>
	);
};

export default PubBody;
