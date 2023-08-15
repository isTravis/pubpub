import React from 'react';
import { Button, Callout, Classes } from '@blueprintjs/core';
import { EditorState, Transaction } from 'prosemirror-state';

import { PopoverButton } from 'components';
import { hasSuggestions } from 'components/Editor/plugins/suggestedEdits/operations';
import { usePageContext } from 'utils/hooks';
import {
	acceptSuggestions,
	rejectSuggestions,
} from 'components/Editor/plugins/suggestedEdits/resolve';

import Download from './Download';
import { usePubContext } from '../pubHooks';
import SmallHeaderButton from './SmallHeaderButton';

type Props = {
	pubData: any;
};

const ConditionalWrapper = ({ condition, wrapper, children }) =>
	condition ? wrapper(children) : children;

const DownloadButton = (props: Props) => {
	const { pubData } = props;
	const { featureFlags } = usePageContext();
	const { collabData } = usePubContext();
	const view = collabData.editorChangeObject?.view;
	const editorState = view?.state;

	const resolveSuggestedEdits = (action: {
		(state: EditorState, from: number, to: number): Transaction;
	}) => {
		if (!editorState) {
			return;
		}

		if (!hasSuggestions(editorState)) {
			return;
		}
		const size = editorState.doc.nodeSize;
		const tr = action(editorState, 0, size - 2);
		view.dispatch(tr);
	};

	const handleSuggestedEditsAccept = () => {
		resolveSuggestedEdits(acceptSuggestions);
	};

	const handleSuggestedEditsReject = () => {
		resolveSuggestedEdits(rejectSuggestions);
	};

	const PopoverContent = () => {
		return (
			<React.Fragment>
				<Callout className="text-info" intent="warning">
					<p>
						You still have pending edits. Resolve your edits before downloading this
						Pub.
					</p>
					<div className={Classes.DIALOG_FOOTER_ACTIONS}>
						<Button
							text="Accept All"
							intent="success"
							onClick={handleSuggestedEditsAccept}
						/>
						<Button
							text="Reject All"
							intent="danger"
							onClick={handleSuggestedEditsReject}
						/>
					</div>
				</Callout>
			</React.Fragment>
		);
	};

	return (
		<ConditionalWrapper
			condition={featureFlags.suggestedEdits && editorState && hasSuggestions(editorState)}
			wrapper={(children) => (
				<PopoverButton
					component={() => <PopoverContent />}
					className="pub-header-popover"
					aria-label="Download this Pub"
				>
					{children}
				</PopoverButton>
			)}
		>
			{featureFlags.suggestedEdits && editorState && hasSuggestions(editorState) ? (
				<SmallHeaderButton label="Download" labelPosition="left" icon="download2" />
			) : (
				<Download pubData={pubData}>
					<SmallHeaderButton label="Download" labelPosition="left" icon="download2" />
				</Download>
			)}
		</ConditionalWrapper>
	);
};

export default DownloadButton;
