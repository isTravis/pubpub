import React from 'react';
import { storiesOf } from '@storybook/react';

import Footnotes from 'containers/Pub/PubDocument/PubBottom/Footnotes';

storiesOf('containers/Pub/PubDocument/PubBottom/Footnotes', module).add('default', () => (
	<div style={{ background: '#F6F4F4', 'min-height': '100vh' }}>
		<div style={{ width: 600, margin: 'auto' }}>
			<Footnotes
				accentColor="#a2273e"
				footnotes={[
					{
						structuredValue: 'https://doi.org/10.21428/8f7503e4',
						unstructuredValue: '<p>Some text for folks.</p>',
						html:
							'<div class="csl-bib-body">\n  <div data-csl-entry-id="temp_id_9869594710326501" class="csl-entry">Ito, J. (2017). Resisting Reduction: A Manifesto. <i>Journal of Design and Science</i>. https://doi.org/10.21428/8f7503e4</div>\n</div>',
					},
					{ structuredValue: '', unstructuredValue: '<p>okok</p>', html: '' },
				]}
			/>
		</div>
	</div>
));
