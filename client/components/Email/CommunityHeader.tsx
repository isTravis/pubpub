import React from 'react';
import dateFormat from 'dateformat';
import styled from 'styled-components';

import { Community } from 'types';
import { getResizedUrl } from 'utils/images';

import { Section } from '.';
import { BaseTableStyle } from './shared';

type Props = {
	title: string;
	community: Community;
};

const TableStyle = styled(BaseTableStyle)`
	width: 100%;
	table-layout: fixed;
	whitespace: nowrap;
`;

const H1Style = styled.h1`
	font-weight: 400;
	font-size: 20px;
	line-height: 28px;
`;

const SpanStyle = styled.span`
	font-weight: 400;
	font-size: 12px;
	font-style: italic;
	line-height: 17px;
`;

const CommunityTitleCellStyle = styled.td`
	width: 75%;
	font-weight: 800;
	font-size: 24px;
	line-height: 40px;
	vertical-align: text-top;
	text-align: right;
`;

const EmailTitleCellStyle = styled.td`
	width: 25%;
`;

export const CommunityHeader = (props: Props) => {
	const now = new Date();
	const {
		community: {
			hideHeaderLogo = false,
			headerLogo = '',
			accentColorDark = 'black',
			accentColorLight = 'white',
		},
	} = props;
	const logo = hideHeaderLogo ? '' : getResizedUrl(headerLogo, 'inside', undefined, 50);
	const showCommunityTitle = hideHeaderLogo || !logo;

	const backgroundColor = props.community.heroBackgroundColor
		? props.community.heroBackgroundColor
		: props.community.headerColorType === 'light'
		? accentColorLight
		: accentColorDark;
	const headerColor =
		props.community.headerColorType === 'light' ? accentColorDark : accentColorLight;

	return (
		<Section color={headerColor} backgroundColor={backgroundColor} logo={logo} alignment="left">
			<TableStyle>
				<EmailTitleCellStyle>
					<H1Style>{props.title}</H1Style>
					<SpanStyle>{dateFormat(now, 'mmmm yyyy')}</SpanStyle>
				</EmailTitleCellStyle>
				{showCommunityTitle && (
					<CommunityTitleCellStyle>{props.community.title}</CommunityTitleCellStyle>
				)}
			</TableStyle>
		</Section>
	);
};
