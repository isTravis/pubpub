import React, { useEffect } from 'react';
import { Toolbar, ToolbarItem, useToolbarState } from 'reakit';
import { Button } from '@blueprintjs/core';

import { setLanguageCommandBuilder, codeBlockToggle } from 'components/Editor/commands';
import { languageModes, languageNames } from 'components/Editor/utils';

import { EditorChangeObjectWithNode } from '../types';
import CommandMenu from '../CommandMenu';

require('./controls.scss');

type Props = {
	editorChangeObject: EditorChangeObjectWithNode;
	onClose: () => unknown;
};

const buttonCommands = languageNames.map((languageName) => ({
	key: `set-${languageName}`,
	title: languageModes[languageName].label,
	command: setLanguageCommandBuilder(languageName),
}));

const ControlsCodeBlock = (props: Props) => {
	const { editorChangeObject, onClose } = props;
	const { view } = editorChangeObject;
	const toolbar = useToolbarState({ loop: true });
	const renderDisclosure = (_, { ref, ...disclosureProps }) => {
		return (
			<div>
				<Button
					rightIcon="caret-down"
					elementRef={ref}
					minimal
					icon="translate"
					text="Select Language"
					{...disclosureProps}
				/>
				<Button
					onClick={codeBlockToggle(view)(view.state).run}
					icon="disable"
					minimal
					text="un-code"
				/>
			</div>
		);
	};

	useEffect(() => {
		if (view) {
			view.dom.addEventListener('keydown', onClose);
			return () => view.dom.removeEventListener('keydown', onClose);
		}
		return () => {};
	}, [view, onClose]);

	return (
		<Toolbar {...toolbar} aria-label="code option dropdown">
			<ToolbarItem
				aria-label="code options"
				as={CommandMenu as any}
				disclosure={renderDisclosure}
				commands={[
					[...buttonCommands, { key: 'oops', title: 'whoops', command: codeBlockToggle }],
				]}
				editorChangeObject={editorChangeObject}
				markActiveItems={false}
				{...toolbar}
			/>
		</Toolbar>
	);
};

export default ControlsCodeBlock;
