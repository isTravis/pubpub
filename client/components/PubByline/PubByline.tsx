import React from 'react';

import Byline, { BylineProps } from 'components/Byline/Byline';
import { getAllPubContributors } from 'utils/contributors';
import { Pub } from 'utils/types';

type OwnProps = {
	pubData: Pub;
	hideAuthors?: boolean;
	hideContributors?: boolean;
};

const defaultProps = {
	hideAuthors: false,
	hideContributors: true,
};

type OwnPubBylineProps = (OwnProps & typeof defaultProps) & Omit<BylineProps, 'contributors'>;

type Props = OwnPubBylineProps & typeof defaultProps;

const PubByline = (props: Props) => {
	const { pubData, hideAuthors = false, hideContributors = false } = props;
	const authors = getAllPubContributors(pubData, hideAuthors, hideContributors);
	// @ts-expect-error ts-migrate(2322) FIXME: Type '{ contributors: AttributionWithUser[]; pubDa... Remove this comment to see the full error message
	return <Byline {...props} contributors={authors} />;
};
PubByline.defaultProps = defaultProps;
export default PubByline;
