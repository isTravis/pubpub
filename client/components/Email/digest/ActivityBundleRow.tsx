import React from 'react';
import styled from 'styled-components';
import pick from 'lodash.pick';

import { ActivityRenderContext } from 'client/utils/activity/types';
import { ActivityItem, ActivityAssociations } from 'types';
import { formatDate } from 'utils/dates';
import { renderActivityItem } from 'client/utils/activity';

import { BaseTableStyle } from '../shared';

type ActivityBundleRowProps = {
	associations: ActivityAssociations;
	userId: string;
	items: ActivityItem[];
};

const ExcerptSpanStyle = styled.span`
	display: inline-block;
	width: 460px;
	margin: 10px 0 0;
	overflow: hidden;
	padding: 8px 11px 7px;
	background: #f5f5f5;
	font-size: 12px;
	font-weight: 400;
	line-height: 14px;
	letter-spacing: 0.01em;
	text-align: left;
`;

const MessageSpanStyle = styled.span`
	font-size: 14px;
	font-weight: 400;
	line-height: 16px;
	letter-spacing: 0.01em;
	text-align: left;
`;

const MessageCellStyle = styled.td`
	width: 70%;
	whitespace: nowrap;
`;

const DateCellStyle = styled.td`
	width: 30%;
	text-align: 'right';
	whitespace: nowrap;
`;

const DateSpanStyle = styled.span`
	font-size: 10px;
	font-style: italic;
	font-weight: 400;
	line-height: 11px;
	letter-spacing: 0em;
	text-align: right;
`;

const ListStyle = styled.ol`
	padding: 0 40px 0 20px;
`;

const TableStyle = styled(BaseTableStyle)`
	width: 100%;
	table-layout: fixed;
	whitespace: nowrap;
`;

const ListItemStyle = styled.li`
	padding: 16px 0;
	border-bottom: 1px solid #dddddd;
`;

export const ActivityBundleRow = (props: ActivityBundleRowProps) => {
	const scope = pick(props.items[0], ['communityId', 'collectionId', 'pubId']);
	const activityRenderContext: ActivityRenderContext = {
		associations: props.associations,
		userId: props.userId,
		scope,
	};
	return (
		<ListStyle>
			{props.items
				.map((item) => renderActivityItem(item, activityRenderContext))
				.map((renderedItem) => (
					<ListItemStyle key={renderedItem.id}>
						<TableStyle>
							<tr>
								<MessageCellStyle>
									<MessageSpanStyle>{renderedItem.message}</MessageSpanStyle>
								</MessageCellStyle>
								<DateCellStyle>
									<DateSpanStyle>
										{formatDate(renderedItem.timestamp, { includeTime: true })}
									</DateSpanStyle>
								</DateCellStyle>
							</tr>
							{renderedItem.excerpt && (
								<tr>
									<td>
										<ExcerptSpanStyle>{renderedItem.excerpt}</ExcerptSpanStyle>
									</td>
								</tr>
							)}
						</TableStyle>
					</ListItemStyle>
				))}
		</ListStyle>
	);
};
