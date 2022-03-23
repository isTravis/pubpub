import React, { useMemo, useState } from 'react';
import { Popover, Button, Icon } from '@blueprintjs/core';

import { Node } from 'prosemirror-model';

require('./pubWordCountButton.scss');

export type Props = {
	doc: Node;
};

const getWordAndCharacterCountsFromDoc = (node: Node) => {
	const text = node.textBetween(0, node.content.size, ' ', ' ');
	const words = text.split(' ').filter((word) => word !== '');
	const wordCount = words.length;
	const characterCount = words.reduce((a, x) => a + x.length, 0);
	return [wordCount, characterCount];
};

const PubHeaderFormattingWordCountButton = (props: Props) => {
	const { doc } = props;
	const [wordCount, characterCount] = useMemo(() => getWordAndCharacterCountsFromDoc(doc), [doc]);
	const [open, setOpen] = useState(false);
	const content = (
		<div className="pub-word-count-button-popover-content">
			<dl>
				<dt>Words</dt>
				<dd>{wordCount.toLocaleString()}</dd>
				<dt>Characters</dt>
				<dd>{characterCount.toLocaleString()}</dd>
			</dl>
		</div>
	);

	return (
		<Popover
			content={content}
			isOpen={open}
			minimal
			position="bottom-right"
			popoverClassName="pub-word-count-button-popover"
			targetClassName="pub-word-count-button-target"
		>
			<Button
				role="button"
				className="bp3-button bp3-minimal"
				onClick={() => setOpen(!open)}
				onBlur={() => setOpen(false)}
			>
				<Icon icon="timeline-line-chart" />
			</Button>
		</Popover>
	);
};

export default PubHeaderFormattingWordCountButton;
