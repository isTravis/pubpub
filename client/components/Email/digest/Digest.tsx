import React from 'react';
import dateFormat from 'dateformat';
import Color from 'color';

import { ActivityAssociations, Community } from 'types';
import { ActivityItem } from 'types/activity';
import { IconName } from 'client/components';

import { Spacer, Section, Wrapper, CommunityHeader } from '..';
import { ActivityBundle, DigestIntro, DigestSectionTitle, DigestFooter } from '.';

type DisplayKey = string;

type AffectedObjectId = string;

export type DedupedActivityItems = {
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

export const Digest = (props: Props) => {
	const {
		community: { accentColorDark = 'black' },
	} = props;
	const date = new Date();

	return (
		<Wrapper
			preview={`Community activity for the week of ${dateFormat(
				date.setDate(date.getDate() - date.getDay()),
				'dd mmmm yyyy',
			)}`}
			backgroundColor={Color(accentColorDark).fade(0.975).rgb().string()}
		>
			<CommunityHeader date={date} community={props.community} title="Activity Digest" />
			<DigestIntro
				date={date}
				community={props.community}
				accentColorDark={accentColorDark}
			/>
			<Section alignment="left">
				<DigestSectionTitle
					icon="office"
					title="Community News"
					accentColorDark={accentColorDark}
				/>
				<ol>
					{Object.entries(props.communityItems).map(([objectId, groupedItems]) => (
						<ActivityBundle
							key={objectId}
							groupedItems={groupedItems}
							isWithTitle={false}
							accentColorDark={accentColorDark}
							associations={props.associations}
							userId={props.userId}
						/>
					))}
				</ol>
				<Spacer height={40}>
					<span>&nbsp;</span>
				</Spacer>
				<DigestSectionTitle
					icon="pubDoc"
					title="Pub News"
					accentColorDark={accentColorDark}
				/>
				<ol>
					{Object.entries(props.pubItems).map(([objectId, groupedItems]) => (
						<ActivityBundle
							key={objectId}
							groupedItems={groupedItems}
							isWithTitle={true}
							accentColorDark={accentColorDark}
							associations={props.associations}
							userId={props.userId}
						/>
					))}
				</ol>
				<DigestFooter community={props.community} />
			</Section>
		</Wrapper>
	);
};
