import React from 'react';
import PropTypes from 'prop-types';
import { PageContext } from 'components/PageWrapper/PageWrapper';
import { pubDataProps } from 'containers/Pub/sharedPropTypes';

require('./details.scss');

const propTypes = {
	pubData: pubDataProps.isRequired,
	updateLocalData: PropTypes.func.isRequired,
};

const Details = (props) => {
	const { pubData, updateLocalData } = props;

	return <div className="pub-meta-details">Details!</div>;
};

Details.propTypes = propTypes;
export default Details;
