import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { moveToEndOfSelection } from 'components/Editor';
import { Button, AnchorButton, InputGroup, Checkbox, Icon } from '@blueprintjs/core';
import { usePubContext } from 'containers/Pub/pubHooks';
import { pubUrl } from 'utils/canonicalUrls';
import { usePageContext } from 'utils/hooks';

type Props = {
	editorChangeObject: {
		activeLink?: any;
		view?: any;
	};
	onClose: (...args: any[]) => any;
};

const ControlsLink = (props: Props) => {
	const {
		editorChangeObject: { activeLink, view },
		onClose,
	} = props;

	const { communityData } = usePageContext();
	const { inPub, pubData } = usePubContext();
	const [href, setHref] = useState(activeLink.attrs.href);
	const [target, setTarget] = useState(activeLink.attrs.target);
	const [debouncedHref] = useDebounce(href, 250);
	const inputRef = useRef();

	const setHashOrUrl = (value: string) => {
		if (inPub) {
			const basePubUrl = pubUrl(communityData, pubData);
			const hashMatches = value.match(`^${basePubUrl}(.*)?#(.*)$`);
			setHref(hashMatches ? `#${hashMatches[2]}` : value);
		}
		setHref(value);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => activeLink.updateAttrs({ href: debouncedHref }), [debouncedHref]);

	useEffect(() => {
		// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
		if (inputRef.current && typeof inputRef.current.focus === 'function' && !href) {
			// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
			inputRef.current.focus();
		}
	}, [href]);

	const restoreSelection = useCallback(() => {
		view.focus();
		moveToEndOfSelection(view);
	}, [view]);

	const handleKeyPress = (evt) => {
		if (evt.key === 'Enter') {
			activeLink.updateAttrs({ href });
			onClose();
			setTimeout(restoreSelection, 0);
		}
	};

	const checkedOpenInNewTab = activeLink.attrs.target === '_blank';

	const handleChange = () => {
		setTarget(activeLink.attrs.target === '_blank' ? '_self' : '_blank');
		activeLink.updateAttrs({ target });
	};

	/* 
	
	if they check this then a new connection
	will be made from the link

	to enable this we should use the link to add a candidate

	on navigation away from component we should create the pub edge

	TODO: Pieces of connections we need

	Since we have the url, we dont need to form a selction on the active link. 
	We need to make it a string and pass it to new edge editor
		but the entire editor is not the preview method

		so how do i extract the preview and what props does it require?

		a link can be 
	


	*/

	function ControlsLinkPopover() {
		return (
			<div>
				<Checkbox
					label="Open in new tab"
					checked={checkedOpenInNewTab}
					onChange={handleChange}
				/>
				<Checkbox label="Create a pub connection for this url" />
				<div>Type: connection type dropdown</div>
				<div>Direction: direction dropdown</div>
				<div style={{ backgroundColor: 'orchid' }}>
					<Icon icon="info-sign" /> Preview
					<Button title="Save Connection" minimal icon="tick">
						Save Connection
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="controls-link-component" style={{ flexDirection: 'column' }}>
			<InputGroup
				placeholder="Enter a URL"
				value={href}
				onChange={(evt) => setHashOrUrl(evt.target.value)}
				onKeyPress={handleKeyPress}
				// @ts-expect-error ts-migrate(2322) FIXME: Type 'MutableRefObject<undefined>' is not assignab... Remove this comment to see the full error message
				inputRef={inputRef}
			/>
			<div>
				<AnchorButton small minimal title="Visit URL" icon="chevron-up" />
				<AnchorButton
					small
					minimal
					title="Optiona"
					icon="share"
					href={href}
					target="_blank"
				/>
				<Button
					small
					minimal
					title="Remove"
					icon="disable"
					onClick={activeLink.removeLink}
				/>
			</div>
			<ControlsLinkPopover />
		</div>
	);
};

export default ControlsLink;
