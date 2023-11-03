import React, { useCallback, useEffect, useMemo, useState } from 'react';
import uuidv4 from 'uuid/v4';
import { Button, Classes } from '@blueprintjs/core';

import { pubUrl } from 'utils/canonicalUrls';
import { usePageContext } from 'utils/hooks';
import { Icon, ClickToCopyButton } from 'components';
import { FormattingBar, FormattingBarSuggestedEdits, buttons } from 'components/FormattingBar';
import { setLocalHighlight, moveToEndOfSelection, isDescendantOf } from 'components/Editor';
import { getResolvableRangeForSelection } from 'components/Editor/plugins/suggestedEdits/resolve';

import { getSuggestionAttrsForNode } from 'client/components/Editor/plugins/suggestedEdits/operations';
import { SuggestedEditsUser } from 'types';
import { apiFetch } from 'client/utils/apiFetch';
import { usePubContext } from '../pubHooks';

require('./pubInlineMenu.scss');

const shouldOpenBelowSelection = () => {
	return ['Android', 'iPad', 'iPhone'].some((device) =>
		navigator.userAgent.toLowerCase().includes(device.toLowerCase()),
	);
};

const PubInlineMenu = () => {
	const { pubData, collabData, historyData, pubBodyState } = usePubContext();
	const { communityData, scopeData } = usePageContext();
	const { canView, canCreateDiscussions } = scopeData.activePermissions;
	const [suggestionAuthor, setSuggestionAuthor] = useState<SuggestedEditsUser>();
	const selection = collabData.editorChangeObject!.selection;
	const [selectedSuggestion, suggestionRange] = useMemo(() => {
		if (collabData.editorChangeObject && collabData.editorChangeObject.view) {
			const doc = collabData.editorChangeObject.view.state.doc;
			const range = getResolvableRangeForSelection(collabData.editorChangeObject.view.state);
			if (range) {
				const node = doc.nodeAt(range.from);
				const attrs = node && getSuggestionAttrsForNode(node);
				return [attrs, range];
			}
		}
		return [null, null];
	}, [collabData.editorChangeObject]);
	const shouldHide = useMemo(() => {
		if (!collabData.editorChangeObject || !collabData.editorChangeObject.view || !selection)
			return true;
		return (
			!selectedSuggestion &&
			(!selection ||
				selection.empty ||
				(selection as any).$anchorCell ||
				collabData.editorChangeObject!.selectedNode ||
				isDescendantOf('code_block', collabData.editorChangeObject!.selection))
		);
	}, [collabData.editorChangeObject, selectedSuggestion, selection]);

	const fetchSuggestionAuthor = useCallback(async () => {
		if (selectedSuggestion) {
			const suggestionUser: SuggestedEditsUser = await apiFetch.get(
				`/api/users?suggestionUserId=${encodeURIComponent(
					selectedSuggestion.suggestionUserId,
				)}`,
			);
			if (suggestionUser) {
				setSuggestionAuthor(suggestionUser);
			}
		}
	}, [selectedSuggestion]);

	useEffect(() => {
		fetchSuggestionAuthor();
	}, [fetchSuggestionAuthor]);

	const selectionBoundingBox: Record<string, any> =
		collabData.editorChangeObject!.selectionBoundingBox || {};

	if (shouldHide) return null;

	const topPosition =
		window.scrollY +
		(shouldOpenBelowSelection()
			? selectionBoundingBox.bottom + 10
			: selectionBoundingBox.top - 50);

	const renderFormattingBar = () => {
		if (pubBodyState.isReadOnly) {
			return null;
		}
		return (
			<FormattingBar
				buttons={buttons.inlineMenuButtonSet}
				isTranslucent
				editorChangeObject={collabData.editorChangeObject!}
				showBlockTypes={false}
				controlsConfiguration={{ kind: 'none' }}
			/>
		);
	};

	return (
		<div
			className={`pub-inline-menu-component ${Classes.ELEVATION_2}`}
			style={{ position: 'absolute', top: topPosition, left: selectionBoundingBox.left }}
		>
			{selectedSuggestion ? (
				<FormattingBarSuggestedEdits
					suggestionAuthor={suggestionAuthor}
					buttons={buttons.suggestedEditsButtonSet}
					editorChangeObject={collabData.editorChangeObject || ({} as any)}
				/>
			) : (
				renderFormattingBar()
			)}
			{(canView || canCreateDiscussions) && pubBodyState.canCreateAnchoredDiscussions && (
				<Button
					aria-label="Start a discussion"
					title="Start a discussion"
					minimal={true}
					icon={<Icon icon="chat" />}
					onClick={() => {
						const view = collabData.editorChangeObject!.view;
						setLocalHighlight(
							view,
							suggestionRange?.from ?? selection.from,
							suggestionRange?.to ?? selection.to,
							uuidv4(),
						);
						moveToEndOfSelection(collabData.editorChangeObject!.view);
					}}
				/>
			)}
			<ClickToCopyButton
				className="click-to-copy"
				icon="clipboard"
				copyString={pubUrl(communityData, pubData, {
					isDraft: !pubData.isRelease,
					releaseNumber: pubData.releaseNumber,
					historyKey: historyData.currentKey,
					query: { from: selection.from, to: selection.to },
				})}
				beforeCopyPrompt="Copy a permalink"
			/>
		</div>
	);
};

export default PubInlineMenu;
