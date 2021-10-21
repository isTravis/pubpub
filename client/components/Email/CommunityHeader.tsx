import React from 'react';
import dateFormat from 'dateformat';
import { Community } from 'types';
import { getResizedUrl } from 'utils/images';
import { Section } from '.';

const now = new Date();

const CommunityHeader = (props: CommunityHeaderProps) => {
	const headerLogo = getResizedUrl(props.community.headerLogo || '', 'inside', undefined, 50);
	return (
		<Section
			color={props.community.accentColorLight}
			backgroundColor={props.community.accentColorDark}
			backgroundImage={headerLogo || ''}
			alignment="left"
		>
			<h1>{props.title}</h1>
			<span>{dateFormat(now, 'mmmm yyyy')}</span>
		</Section>
	);
};

type CommunityHeaderProps = {
	title: string;
	community: Community;
};

export default CommunityHeader;
