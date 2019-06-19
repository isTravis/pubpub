import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Editor, {
	getText,
	getJSON,
	removeLocalHighlight,
	convertLocalHighlightToDiscussion,
} from '@pubpub/editor';
import { AnchorButton, Button, Intent } from '@blueprintjs/core';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import { Avatar, FormattingBar } from 'components';
import { apiFetch } from 'utils';

const propTypes = {
	pubData: PropTypes.object.isRequired,
	collabData: PropTypes.object.isRequired,
	firebaseBranchRef: PropTypes.object.isRequired,
	threadData: PropTypes.array.isRequired,
	updateLocalData: PropTypes.func.isRequired,
	setActiveThread: PropTypes.func.isRequired,
	tempContextValues: PropTypes.object,
};

const defaultProps = {
	/* This is needed for the embedAddon */
	/* Remove this if/when we refactor the way */
	/* discussion embdeds work */
	tempContextValues: undefined,
};

const DiscussionInput = (props) => {
	const {
		pubData,
		collabData,
		updateLocalData,
		threadData,
		setActiveThread,
		tempContextValues,
	} = props;
	const pageWrapperContextValues = useContext(PageContext);
	const { loginData, locationData, communityData } =
		tempContextValues || pageWrapperContextValues;
	const pubView = collabData.editorChangeObject.view;
	const [changeObject, setChangeObject] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [didFocus, setDidFocus] = useState(false);
	const isNewThread = !threadData[0].threadNumber;
	useEffect(() => {
		if ((isNewThread || didFocus) && changeObject.view) {
			changeObject.view.focus();
		}
	}, [isNewThread, changeObject.view, didFocus]);

	const handlePostDiscussion = () => {
		setIsLoading(true);
		return apiFetch('/api/discussions', {
			method: 'POST',
			body: JSON.stringify({
				discussionId: isNewThread ? threadData[0].id : undefined,
				threadNumber: isNewThread ? undefined : threadData[0].threadNumber,
				userId: loginData.id,
				pubId: pubData.id,
				branchId: pubData.activeBranch.id,
				communityId: communityData.id,
				content: getJSON(changeObject.view),
				text: getText(changeObject.view) || '',
			}),
		})
			.then((discussionData) => {
				if (!isNewThread) {
					return Promise.all([discussionData]);
				}
				return Promise.all([
					discussionData,
					convertLocalHighlightToDiscussion(
						pubView,
						threadData[0].id,
						props.firebaseBranchRef,
					),
				]);
			})
			.then(([discussionData]) => {
				updateLocalData('pub', {
					...pubData,
					discussions: [...pubData.discussions, discussionData],
				});
				if (isNewThread) {
					setActiveThread(discussionData.id);
				}
			});
	};

	const isLoggedIn = loginData.id;
	const redirectString = `?redirect=${locationData.path}${
		locationData.queryString.length > 1 ? locationData.queryString : ''
	}`;
	return (
		<div className="discussion-item input">
			<div className="avatar-wrapper">
				<Avatar width={18} userInitials={loginData.intials} userAvatar={loginData.avatar} />
			</div>
			{!isLoggedIn && (
				<React.Fragment>
					<AnchorButton
						className="discussion-primary-button"
						text="Login to discuss"
						href={`/login${redirectString}`}
						small={true}
					/>
					{isNewThread && (
						<Button
							className="discussion-cancel-button"
							text="Cancel"
							small={true}
							onClick={() => {
								removeLocalHighlight(pubView, threadData[0].id);
							}}
						/>
					)}
				</React.Fragment>
			)}
			{isLoggedIn && !isNewThread && !didFocus && (
				<input
					type="text"
					className="simple-input"
					placeholder="Add a reply..."
					onFocus={() => {
						setDidFocus(true);
					}}
				/>
			)}
			{isLoggedIn && (isNewThread || didFocus) && (
				<div className="content-wrapper">
					<div className="discussion-body-wrapper editable">
						<Editor
							placeholder={isNewThread ? 'Add your discussion...' : 'Add a reply...'}
							onChange={(editorChangeObject) => {
								setChangeObject(editorChangeObject);
							}}
						/>
					</div>
					<FormattingBar
						editorChangeObject={changeObject || {}}
						threads={[]}
						hideBlocktypes={true}
						hideExtraFormatting={true}
						isSmall={true}
					/>
					<Button
						className="discussion-primary-button"
						intent={Intent.PRIMARY}
						text={isNewThread ? 'Post Discussion' : 'Post Reply'}
						loading={isLoading}
						disabled={!getText(changeObject.view)}
						onClick={handlePostDiscussion}
						small={true}
					/>
					{isNewThread && (
						<Button
							className="discussion-cancel-button"
							text="Cancel"
							small={true}
							onClick={() => {
								removeLocalHighlight(pubView, threadData[0].id);
							}}
						/>
					)}
				</div>
			)}
		</div>
	);
};

DiscussionInput.propTypes = propTypes;
DiscussionInput.defaultProps = defaultProps;
export default DiscussionInput;
