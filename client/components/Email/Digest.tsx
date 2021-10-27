import React from 'react';
import { ActivityItem } from 'types/activity';
import { ActivityAssociations, Community } from 'types';
import dateFormat from 'dateformat';
import { Icon, IconName } from 'client/components';
import Color from 'color';
import { communityUrl } from 'utils/canonicalUrls';
import styled from 'styled-components';
import { Spacer, Section, Wrapper, Button } from '.';
import ActivityBundleRow from './ActivityBundleRow';
import CommunityHeader from './CommunityHeader';

const H2 = styled.h2<H2StyleProps>`
	font-family: Arial;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 18px;
	text-align: left;
	letter-spacing: 0.01em;
	display: inline-block;
	color: ${(props) => props.accentColorDark || 'black'};
`;

type H2StyleProps = {
	accentColorDark?: string;
};

const H3 = styled.h3`
	font-family: Arial;
	font-size: 14px;
	font-style: normal;
	font-weight: 700;
	line-height: 16px;
	text-align: left;
	letter-spacing: 0.01em;
	display: inline-block;
`;

const now = new Date();

const MAX_TITLE_CHARS = 65;

const truncate = (str: string) =>
	str.length > MAX_TITLE_CHARS ? str.substr(0, MAX_TITLE_CHARS - 1) + '…' : str;

export const Digest = (props: Props) => {
	const {
		community: { accentColorLight = 'white', accentColorDark = 'black' },
	} = props;

	const backgroundColor =
		props.community.headerColorType === 'light'
			? accentColorLight || 'white'
			: accentColorDark || 'black';
	const headerColor =
		props.community.headerColorType === 'light'
			? accentColorDark || 'black'
			: accentColorLight || 'white';
	const fadedBackgroundColor = Color(accentColorDark)
		.fade(0.95)
		.rgb()
		.string();

	return (
		<Wrapper>
			<CommunityHeader
				community={props.community}
				// headerColor={props.community.heroTextColor || headerColor}
				headerColor={headerColor}
				backgroundColor={props.community.heroBackgroundColor || backgroundColor}
				title="Activity Digest"
			/>
			<Section backgroundColor={fadedBackgroundColor}>
				<table>
					<tr>
						<td
							style={{
								paddingRight: '40px',
								fontSize: '12px',
								lineHeight: '18px',
								fontWeight: 400,
								textAlign: 'justify',
							}}
						>
							This digest is a compilation of activity in the&nbsp;
							<a href={communityUrl(props.community)}>{props.community.title}</a>
							&nbsp;community during the week of&nbsp;
							{dateFormat(now.setDate(now.getDate() - now.getDay()), 'dd mmmm yyyy')}.
						</td>
						<td style={{ verticalAlign: 'middle' }}>
							<Button color="#333333" linkUrl="" width="160">
								<span style={{ fill: '#333333', paddingRight: '9px' }}>
									<Icon icon="pulse" />
								</span>
								<span>View latest activity</span>
							</Button>
						</td>
					</tr>
				</table>
			</Section>
			<Section alignment="left">
				<div
					style={{
						borderBottom: `1px solid ${accentColorDark}`,
						paddingBottom: '15px',
					}}
				>
					<span style={{ fill: accentColorDark, paddingRight: '9px' }}>
						<Icon icon="office" iconSize={12} />
					</span>
					<H2 accentColorDark={accentColorDark}>Community News</H2>
				</div>
				<ol>
					{Object.entries(props.communityItems).map(([objectId, groupedItems]) => (
						<li key={objectId} style={{ paddingTop: '17px' }}>
							<strong>{truncate(groupedItems.title)}</strong>
							<ActivityBundleRow
								associations={props.associations}
								userId={props.userId}
								items={Object.values(groupedItems.items)}
							/>
						</li>
					))}
				</ol>
				<Spacer height={40}>
					<span>&nbsp;</span>
				</Spacer>
				<div
					style={{
						borderBottom: `1px solid ${accentColorDark}`,
						paddingBottom: '15px',
					}}
				>
					<span style={{ fill: accentColorDark, paddingRight: '9px' }}>
						<Icon icon="pubDoc" iconSize={12} />
					</span>
					<H2 accentColorDark={accentColorDark}>Pub News</H2>
				</div>
				<ol>
					{Object.entries(props.pubItems).map(([objectId, groupedItems]) => {
						return (
							<li key={objectId} style={{ paddingTop: '17px' }}>
								<span style={{ fill: accentColorDark, paddingRight: '9px' }}>
									<Icon iconSize={12} icon={groupedItems.icon} />
								</span>
								<H3>{truncate(groupedItems.title)}</H3>
								<ActivityBundleRow
									associations={props.associations}
									userId={props.userId}
									items={Object.values(groupedItems.items)}
								/>
							</li>
						);
					})}
				</ol>
			</Section>
		</Wrapper>
	);
};

type DisplayKey = string;

type AffectedObjectId = string;

type DedupedActivityItems = {
	items: Record<DisplayKey, ActivityItem>;
	title: string;
	icon: IconName;
};

export type GroupedActivityItems = Record<AffectedObjectId, DedupedActivityItems>;

type Props = {
	userId: string;
	community: Community;
	associations: ActivityAssociations;
	pubItems: GroupedActivityItems;
	communityItems: GroupedActivityItems;
};
