import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import TimeAgo from 'react-timeago';
import classNames from 'classnames';
import Editor, { getText, getJSON } from '@pubpub/editor';
import { Button, Intent } from '@blueprintjs/core';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import { Avatar, Icon, FormattingBar } from 'components';
import { apiFetch } from 'utils';

const propTypes = {
	discussionData: PropTypes.object.isRequired,
	pubData: PropTypes.object.isRequired,
	updateLocalData: PropTypes.func.isRequired,
	tempContextValues: PropTypes.object,
};

const defaultProps = {
	/* This is needed for the embedAddon */
	/* Remove this if/when we refactor the way */
	/* discussion embdeds work */
	tempContextValues: undefined,
};

const DiscussionItem = (props) => {
	const { discussionData, pubData, updateLocalData, tempContextValues } = props;
	const pageWrapperContextValues = useContext(PageContext);
	const { loginData, communityData } = tempContextValues || pageWrapperContextValues;
	const [isEditing, setIsEditing] = useState(false);
	const [changeObject, setChangeObject] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const handlePutDiscussion = () => {
		setIsLoading(true);
		return apiFetch('/api/discussions', {
			method: 'PUT',
			body: JSON.stringify({
				discussionId: discussionData.id,
				userId: loginData.id,
				pubId: pubData.id,
				branchId: pubData.activeBranch.id,
				communityId: communityData.id,
				content: getJSON(changeObject.view),
				text: getText(changeObject.view) || '',
			}),
		})
			.then((updatedDiscussionData) => {
				updateLocalData('pub', {
					...pubData,
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
			})
			.then(() => {
				setIsEditing(false);
				setChangeObject({});
				setIsLoading(false);
			});
	};

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
					<span className="name">{discussionData.author.fullName}</span>

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

					{loginData.id === discussionData.userId && (
						<span className="actions">
							<Button
								icon={isEditing ? undefined : <Icon icon="edit2" iconSize={12} />}
								text={isEditing ? 'Cancel' : undefined}
								minimal={true}
								small={true}
								onClick={() => {
									setIsEditing(!isEditing);
								}}
							/>
						</span>
					)}
				</div>
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
							className="discussion-primary-button"
							intent={Intent.PRIMARY}
							text="Update Discussion"
							loading={isLoading}
							disabled={!getText(changeObject.view)}
							onClick={handlePutDiscussion}
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
