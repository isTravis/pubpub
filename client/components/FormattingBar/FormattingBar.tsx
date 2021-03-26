import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Toolbar, ToolbarItem, useToolbarState } from 'reakit';
import { EditorView } from 'prosemirror-view';

import { usePageContext } from 'utils/hooks';
import { useRefMap } from 'client/utils/useRefMap';
import { EditorChangeObject } from 'client/components/Editor';

import BlockTypeSelector from './BlockTypeSelector';
import FormattingBarButton from './FormattingBarButton';
import FormattingBarPopover from './FormattingBarPopover';
import { FormattingBarButtonData, PopoverStyle } from './types';
import { getButtonPopoverComponent } from './utils';
import { usePendingAttrs } from './hooks/usePendingAttrs';
import { useControlsState, ButtonState } from './hooks/useControlsState';

require('./formattingBar.scss');

type Props = {
	popoverContainerRef?: React.RefObject<HTMLElement>;
	editorChangeObject: EditorChangeObject;
	buttons: FormattingBarButtonData[][];
	showBlockTypes?: boolean;
	isSmall?: boolean;
	isTranslucent?: boolean;
	isFullScreenWidth?: boolean;
	citationStyle?: string;
	popoverStyle?: PopoverStyle;
};

const shimEditorChangeObject = ({
	view: {} as EditorView,
	selectedNode: null,
	updateNode: () => {},
} as unknown) as EditorChangeObject;

const FormattingBar = (props: Props) => {
	const {
		editorChangeObject: propsEditorChangeObject,
		popoverContainerRef,
		isSmall = false,
		showBlockTypes = !isSmall,
		popoverStyle = isSmall ? 'floating' : 'anchored',
		isTranslucent = false,
		isFullScreenWidth = false,
		citationStyle = 'apa',
		buttons,
	} = props;

	const editorChangeObject = propsEditorChangeObject || shimEditorChangeObject;
	const { selectedNode, updateNode } = editorChangeObject;
	const { communityData } = usePageContext();
	const buttonElementRefs = useRefMap();
	const wrapperRef = useRef<null | HTMLDivElement>(null);
	const toolbar = useToolbarState({ loop: true });

	const pendingAttrs = usePendingAttrs({
		selectedNode,
		updateNode,
		editorView: editorChangeObject.view,
	});

	const {
		openedButton,
		setOpenedButton,
		controlsPosition,
		selectedNodeId,
		ControlsComponent,
		buttonStates,
	} = useControlsState({
		buttons,
		popoverStyle,
		editorChangeObject,
		positioningRootRef: popoverContainerRef || wrapperRef,
	});

	useEffect(() => {
		if (openedButton) {
			const ref = buttonElementRefs.getRef(openedButton.key);
			if (ref && ref.current && typeof ref.current.scrollIntoView === 'function') {
				const buttonElement = ref.current;
				const paddingPx = 5;
				buttonElement.parentNode.scrollLeft = buttonElement.offsetLeft - paddingPx;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openedButton]);

	const renderButtonState = (buttonState: ButtonState) => {
		const { button, isOpen, isActive, isIndicated, isDisabled, onClick } = buttonState;
		const maybeEditorView = button.key === 'media' && { view: editorChangeObject.view };
		const PopoverComponent = getButtonPopoverComponent(button, isDisabled);

		return (
			<ToolbarItem
				{...toolbar}
				outerRef={buttonElementRefs.getRef(button.key)}
				as={button.component || FormattingBarButton}
				key={button.key}
				formattingItem={button}
				disabled={isDisabled}
				isActive={isActive}
				isIndicated={isIndicated && !isOpen}
				isOpen={isOpen}
				isDetached={isOpen && !!controlsPosition}
				isSmall={isSmall}
				popoverContent={PopoverComponent && <PopoverComponent />}
				accentColor={communityData.accentColorDark}
				onClick={onClick}
				{...maybeEditorView}
			/>
		);
	};

	const renderButtonGroup = (states: ButtonState[], index: number) => {
		return (
			<React.Fragment key={index}>
				{index > 0 && <div className="separator" />}
				{states.map(renderButtonState)}
			</React.Fragment>
		);
	};

	return (
		<div
			ref={wrapperRef}
			className={classNames(
				'formatting-bar-component',
				isSmall && 'small',
				isTranslucent && 'translucent',
			)}
		>
			<Toolbar aria-label="Formatting toolbar" className="toolbar" {...toolbar}>
				{showBlockTypes && (
					<React.Fragment>
						<ToolbarItem
							as={BlockTypeSelector}
							isSmall={isSmall}
							editorChangeObject={editorChangeObject}
							{...toolbar}
						/>
						<div className="separator" />
					</React.Fragment>
				)}
				{buttonStates.map(renderButtonGroup)}
			</Toolbar>
			{ControlsComponent && openedButton && (
				<FormattingBarPopover
					editorChangeObject={editorChangeObject}
					accentColor={communityData.accentColorDark}
					title={openedButton.ariaTitle || openedButton.title}
					isFullScreenWidth={isFullScreenWidth}
					containerRef={popoverContainerRef}
					floatingPosition={controlsPosition}
					captureFocusOnMount={openedButton.controls?.captureFocusOnMount}
					showCloseButton={openedButton.controls?.showCloseButton}
					onClose={() => setOpenedButton(null)}
				>
					<ControlsComponent
						key={selectedNodeId}
						editorChangeObject={editorChangeObject}
						isSmall={isSmall}
						citationStyle={citationStyle}
						pendingAttrs={pendingAttrs}
						onClose={() => setOpenedButton(null)}
					/>
				</FormattingBarPopover>
			)}
		</div>
	);
};

export default FormattingBar;
