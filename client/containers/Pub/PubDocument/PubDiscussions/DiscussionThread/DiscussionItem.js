import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import TimeAgo from 'react-timeago';
import classNames from 'classnames';
import Editor, { getText, getJSON } from '@pubpub/editor';
import { Button, Intent, Tooltip } from '@blueprintjs/core';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import { Avatar, Icon, FormattingBar } from 'components';
import { apiFetch } from 'utils';
import LabelSelect from './LabelSelect';
import DiscussionReanchor from './DiscussionReanchor';

const propTypes = {
	collabData: PropTypes.object.isRequired,
	firebaseBranchRef: PropTypes.object,
	discussionData: PropTypes.object.isRequired,
	pubData: PropTypes.object.isRequired,
	updateLocalData: PropTypes.func.isRequired,
	isRootThread: PropTypes.bool.isRequired,
	isPreview: PropTypes.bool,
};

const defaultProps = {
	isPreview: false,
	firebaseBranchRef: null,
};

const DiscussionItem = (props) => {
	const {
		discussionData,
		collabData,
		firebaseBranchRef,
		pubData,
		updateLocalData,
		isRootThread,
		isPreview,
	} = props;
	const { loginData, communityData } = useContext(PageContext);
	const [isEditing, setIsEditing] = useState(false);
	const [changeObject, setChangeObject] = useState({});
	const [isLoadingEdit, setIsLoadingEdit] = useState(false);
	const [isLoadingArchive, setIsLoadingArchive] = useState(false);

	const handlePutDiscussion = (discussionUpdates) => {
		return apiFetch('/api/discussions', {
			method: 'PUT',
			body: JSON.stringify({
				...discussionUpdates,
				discussionId: discussionData.id,
				userId: loginData.id,
				pubId: pubData.id,
				branchId: pubData.activeBranch.id,
				communityId: communityData.id,
			}),
		}).then((updatedDiscussionData) => {
			updateLocalData('pub', {
				discussions: pubData.discussions.map((discussion) => {
					if (discussion.id !== discussionData.id) {
						return discussion;
					}
					return {
						...discussion,
						...updatedDiscussionData,
					};
				}),
			});
		});
	};

	const isDiscussionAuthor = loginData.id === discussionData.userId;
	return (
		<div className="discussion-item">
			<div className="avatar-wrapper">
				<Avatar
					width={18}
					userInitials={discussionData.author.intials}
					userAvatar={discussionData.author.avatar}
				/>
			</div>
			<div className="content-wrapper">
				<div className="item-header">
					<span className="name">
						{discussionData.author.fullName}
						{isPreview ? ': ' : ''}
					</span>

					{isPreview && <span className="preview-text">{discussionData.text}</span>}
					{!isPreview && (
						<span className="time">
							{!isEditing && (
								<TimeAgo
									minPeriod={60}
									formatter={(value, unit, suffix) => {
										if (unit === 'second') {
											return 'just now';
										}
										let newUnit = unit;
										if (value > 1) {
											newUnit += 's';
										}
										return `${value} ${newUnit} ${suffix}`;
									}}
									date={discussionData.createdAt}
								/>
							)}
						</span>
					)}

					<span className="actions">
						{!isPreview && pubData.canManage && isRootThread && firebaseBranchRef && (
							<DiscussionReanchor
								collabData={collabData}
								firebaseBranchRef={firebaseBranchRef}
								discussionId={discussionData.id}
							/>
						)}
						{!isPreview && (isDiscussionAuthor || pubData.canManage) && isRootThread && (
							<React.Fragment>
								<LabelSelect
									availableLabels={pubData.labels || []}
									labelsData={discussionData.labels || []}
									onPutDiscussion={handlePutDiscussion}
									canManagePub={pubData.canManage}
									canManageThread={isDiscussionAuthor}
								/>
								<Tooltip
									content={discussionData.isArchived ? 'Unarchive' : 'Archive'}
								>
									<Button
										icon={
											<Icon
												icon={
													discussionData.isArchived ? 'export' : 'import'
												}
												iconSize={12}
											/>
										}
										minimal={true}
										small={true}
										loading={isLoadingArchive}
										alt={discussionData.isArchived ? 'Unarchive' : 'Archive'}
										onClick={() => {
											setIsLoadingArchive(true);
											handlePutDiscussion({
												isArchived: !discussionData.isArchived,
											});
										}}
									/>
								</Tooltip>
							</React.Fragment>
						)}
						{!isPreview && isDiscussionAuthor && (
							<Button
								icon={isEditing ? undefined : <Icon icon="edit2" iconSize={12} />}
								text={isEditing ? 'Cancel' : undefined}
								minimal={true}
								small={true}
								onClick={() => {
									setIsEditing(!isEditing);
								}}
							/>
						)}
					</span>
				</div>
				{!isPreview && (
					<div
						className={classNames({
							'discussion-body-wrapper': true,
							editable: isEditing,
						})}
					>
						<Editor
							key={`${isEditing}-${discussionData.text}`}
							isReadOnly={!isEditing}
							initialContent={discussionData.content}
							onChange={(editorChangeObject) => {
								if (isEditing) {
									setChangeObject(editorChangeObject);
								}
							}}
						/>
					</div>
				)}
				{isEditing && (
					<React.Fragment>
						<FormattingBar
							editorChangeObject={changeObject || {}}
							threads={[]}
							hideBlocktypes={true}
							hideExtraFormatting={true}
							isSmall={true}
						/>
						<Button
							small
							className="discussion-primary-button"
							intent={Intent.PRIMARY}
							text="Update Discussion"
							loading={isLoadingEdit}
							disabled={!getText(changeObject.view)}
							onClick={() => {
								setIsLoadingEdit(true);
								handlePutDiscussion({
									content: getJSON(changeObject.view),
									text: getText(changeObject.view) || '',
								}).then(() => {
									setIsEditing(false);
									setChangeObject({});
									setIsLoadingEdit(false);
								});
							}}
						/>
					</React.Fragment>
				)}
			</div>
		</div>
	);
};

DiscussionItem.propTypes = propTypes;
DiscussionItem.defaultProps = defaultProps;
export default DiscussionItem;
