import React, { useContext, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Editor from '@pubpub/editor';
import { getResizedUrl } from 'utils';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import discussionSchema from './DiscussionAddon/discussionSchema';
import { nestDiscussionsToThreads } from './PubDiscussions/discussionUtils';
import DiscussionThread from './PubDiscussions/DiscussionThread';

require('./pubBody.scss');

const propTypes = {
	pubData: PropTypes.object.isRequired,
	collabData: PropTypes.object.isRequired,
	historyData: PropTypes.object.isRequired,
	firebaseBranchRef: PropTypes.object,
	updateLocalData: PropTypes.func.isRequired,
	onSingleClick: PropTypes.func.isRequired,
};
const defaultProps = {
	firebaseBranchRef: undefined,
};

let setSavingTimeout;

const PubBody = (props) => {
	const { pubData, collabData, firebaseBranchRef, updateLocalData, historyData } = props;
	const tempContextValues = useContext(PageContext);
	const { isViewingHistory } = historyData;
	const prevStatusRef = useRef(null);
	const embedDiscussions = useRef({});
	prevStatusRef.current = collabData.status;

	const getNextStatus = (status, onComplete) => {
		clearTimeout(setSavingTimeout);
		const prevStatus = prevStatusRef.current;
		const nextStatus = { status: status };

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
			}
		}
		/* If disconnected, only set state if the new status is 'connected' */
		if (prevStatus === 'disconnected' && status === 'connected') {
			onComplete(nextStatus);
		}
	};
	const editorKeyHistory = isViewingHistory && historyData.historyDocKey;
	const editorKeyCollab = firebaseBranchRef ? 'ready' : 'unready';
	const editorKey = editorKeyHistory || editorKeyCollab;
	const isHistoryDoc = isViewingHistory && historyData.historyDoc;
	const useCollaborativeOptions = firebaseBranchRef && !pubData.isStaticDoc && !isHistoryDoc;
	const isReadOnly = !!(pubData.isStaticDoc || !pubData.canEditBranch || isViewingHistory);
	const initialContent = (isViewingHistory && historyData.historyDoc) || pubData.initialDoc;
	console.log('embedDiscussions', JSON.stringify(Object.keys(embedDiscussions.current)));
	return (
		<div className="pub-body-component">
			<Editor
				key={editorKey}
				customNodes={{
					...discussionSchema,
				}}
				nodeOptions={{
					image: {
						onResizeUrl: (url) => {
							return getResizedUrl(url, 'fit-in', '800x0');
						},
					},
					discussion: {
						getInputProps: () => {
							return {
								pubData: pubData,
								collabData: collabData,
								firebaseBranchRef: firebaseBranchRef,
								updateLocalData: updateLocalData,
							};
						},
						addRef: (embedId, mountRef, threadNumber) => {
							embedDiscussions.current[embedId] = {
								mountRef: mountRef,
								threadNumber: threadNumber,
							};
						},
						removeRef: (embedId) => {
							console.log('removing ref');
							delete embedDiscussions.current[embedId];
						},
						// renderPortal: (mountRef, threadNumber) => {
						// 	console.log('in render call');
						// 	const threads = nestDiscussionsToThreads(pubData.discussions);
						// 	const activeThread = threads.reduce((prev, curr) => {
						// 		if (curr[0].threadNumber === threadNumber) {
						// 			return curr;
						// 		}
						// 		return prev;
						// 	}, undefined);
						// 	console.log(threads, threadNumber, activeThread);
						// 	if (!activeThread) {
						// 		return undefined;
						// 	}
						// 	if (!mountRef.current) {
						// 		return undefined;
						// 	}
						// 	console.log('About to render portal');
						// 	return ReactDOM.createPortal(
						// 		<DiscussionThread
						// 			pubData={pubData}
						// 			collabData={collabData}
						// 			firebaseBranchRef={firebaseBranchRef}
						// 			threadData={activeThread}
						// 			updateLocalData={updateLocalData}
						// 		/>,
						// 		mountRef.current,
						// 	);
						// },
						// getThreadElement: (threadNumber) => {
						// 	const threads = nestDiscussionsToThreads(pubData.discussions);
						// 	const activeThread = threads.reduce((prev, curr) => {
						// 		if (curr[0].threadNumber === threadNumber) {
						// 			return curr;
						// 		}
						// 		return prev;
						// 	}, undefined);
						// 	if (!activeThread) {
						// 		return undefined;
						// 	}
						// 	return (
						// 		<DiscussionThread
						// 			pubData={pubData}
						// 			collabData={collabData}
						// 			firebaseBranchRef={firebaseBranchRef}
						// 			threadData={activeThread}
						// 			updateLocalData={updateLocalData}
						// 			setActiveThread={() => {}}
						// 			tempContextValues={tempContextValues}
						// 		/>
						// 	);
						// },
					},
				}}
				placeholder={pubData.isStaticDoc ? undefined : 'Begin writing here...'}
				initialContent={initialContent}
				isReadOnly={isReadOnly}
				onChange={(editorChangeObject) => {
					if (!isHistoryDoc) {
						updateLocalData('collab', { editorChangeObject: editorChangeObject });
					}
				}}
				collaborativeOptions={
					useCollaborativeOptions
						? {
								firebaseRef: firebaseBranchRef,
								clientData: props.collabData.localCollabUser,
								initialDocKey: pubData.initialDocKey,
								onStatusChange: (status) => {
									getNextStatus(status, (nextStatus) => {
										props.updateLocalData('collab', nextStatus);
									});
								},
								onUpdateLatestKey: (latestKey) => {
									props.updateLocalData('history', {
										latestKey: latestKey,
										currentKey: latestKey,
									});
								},
						  }
						: undefined
				}
				highlights={[]}
				handleSingleClick={props.onSingleClick}
			/>
			{Object.keys(embedDiscussions.current).map((embedId) => {
				const mountRef = embedDiscussions.current[embedId].mountRef;
				const threadNumber = embedDiscussions.current[embedId].threadNumber;
				const threads = nestDiscussionsToThreads(pubData.discussions);
				const activeThread = threads.reduce((prev, curr) => {
					if (curr[0].threadNumber === threadNumber) {
						return curr;
					}
					return prev;
				}, undefined);
				// console.log(threads, threadNumber, activeThread);
				if (!activeThread) {
					return undefined;
				}
				if (!mountRef.current) {
					return undefined;
				}
				return ReactDOM.createPortal(
					<DiscussionThread
						key={embedId}
						pubData={pubData}
						collabData={collabData}
						firebaseBranchRef={firebaseBranchRef}
						threadData={activeThread}
						updateLocalData={updateLocalData}
						canPreview={true}
					/>,
					mountRef.current,
				);
			})}
		</div>
	);
};

PubBody.propTypes = propTypes;
PubBody.defaultProps = defaultProps;
export default PubBody;
