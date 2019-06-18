import React from 'react';
import { storiesOf } from '@storybook/react';
import PubDetails from 'containers/Pub/PubDetails';
import { pubData } from 'data';

storiesOf('containers/Pub/PubDetails', module).add('default', () => (
	<PubDetails
		pubData={{
			...pubData,
			attributions: [
				...pubData.attributions,
				...pubData.attributions,
				...pubData.attributions,
			],
		}}
	/>
));
