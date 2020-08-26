import React from 'react';

import { Byline } from 'components';
import { getAllPubContributors } from 'utils/pub/contributors';
// @ts-expect-error ts-migrate(2614) FIXME: Module '"../Byline/Byline"' has no exported member... Remove this comment to see the full error message
import { propTypes as bylinePropTypes } from '../Byline/Byline';

const { contributors, ...bylinePropTypesWithoutContributors } = bylinePropTypes;

/*
(ts-migrate) TODO: Migrate the remaining prop types
...bylinePropTypesWithoutContributors
*/
type OwnProps = {
	pubData: {};
	hideAuthors?: boolean;
	hideContributors?: boolean;
};
const defaultProps = {
	hideAuthors: false,
	hideContributors: true,
	...Byline.defaultProps,
};

type Props = OwnProps & typeof defaultProps;

const PubByline = (props: Props) => {
	const { pubData, hideAuthors, hideContributors } = props;
	const authors = getAllPubContributors(pubData, hideAuthors, hideContributors);

	// @ts-expect-error ts-migrate(2322) FIXME: Type 'any[]' is not assignable to type 'never'.
	return <Byline {...props} contributors={authors} />;
};
PubByline.defaultProps = defaultProps;
export default PubByline;
