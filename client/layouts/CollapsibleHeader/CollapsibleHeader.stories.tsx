import React from 'react';
import { storiesOf } from '@storybook/react';
import { locationData, loginData } from 'utils/storybook/data';

import CollapsibleHeader from './CollapsibleHeader';
import collapsibleHeaderData from './collapsibleHeaderData';

storiesOf('components/CollapsibleHeader', module).add('default', () => (
	<CollapsibleHeader
		{...collapsibleHeaderData}
		locationData={locationData}
		loginData={loginData}
	/>
));
