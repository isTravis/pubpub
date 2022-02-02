import React, { useEffect } from 'react';

import { usePageContext } from 'utils/hooks';

import PubSyncManager from './PubSyncManager';
import PubHeader from './PubHeader';
import SpubHeader from './SpubHeader';
import PubDocument from './PubDocument';
import { PubSuspendWhileTypingProvider, PubSuspendWhileTyping } from './PubSuspendWhileTyping';

require('./pub.scss');

type Props = {
	pubData: any;
};

const isInViewport = (rect: DOMRect, offsets: { top?: number; left?: number } = {}) => {
	const { top, left, bottom, right } = rect;
	const { innerWidth, innerHeight } = window;
	const { clientWidth, clientHeight } = document.documentElement;
	const { top: offsetTop, left: offsetLeft } = { top: 0, left: 0, ...offsets };

	return (
		top >= offsetTop &&
		left >= offsetLeft &&
		bottom <= (innerHeight || clientHeight) &&
		right <= (innerWidth || clientWidth)
	);
};

const scrollToElementTop = (hash: string, delay = 0) => {
	let element: HTMLElement | null;

	try {
		element = document.getElementById(hash.replace('#', ''));
	} catch {
		return;
	}

	if (!element) {
		return;
	}

	setTimeout(() => {
		const rect = (element as HTMLElement).getBoundingClientRect();

		if (!isInViewport(rect, { top: 50 })) {
			document.body.scrollTop += rect.top - 80;
		}
	}, delay);
};

const Pub = (props: Props) => {
	const { loginData, locationData, communityData } = usePageContext();
	const hasSubmission =
		'submission' in props.pubData && props.pubData.submission?.status === 'incomplete';
	useEffect(() => {
		const { hash } = window.location;

		if (hash) {
			scrollToElementTop(hash, 500);
		}

		const onClick = (event: MouseEvent) => {
			const { target, metaKey } = event;

			if (target instanceof HTMLAnchorElement && !metaKey) {
				const href = target.getAttribute('href');

				if (href && href.indexOf('#') === 0) {
					event.preventDefault();
					window.location.hash = href;
					scrollToElementTop(href);
				}
			}
		};

		if (props.pubData.isReadOnly) {
			document.addEventListener('click', onClick);
			return () => document.removeEventListener('click', onClick);
		}

		return () => {};
	}, [props.pubData]);

	return (
		<PubSuspendWhileTypingProvider>
			<div id="pub-container">
				<PubSyncManager
					pubData={props.pubData}
					locationData={locationData}
					communityData={communityData}
					loginData={loginData}
				>
					{({ pubData, collabData, firebaseDraftRef, updateLocalData, historyData }) => {
						const modeProps = {
							pubData,
							collabData,
							historyData,
							firebaseDraftRef,
							updateLocalData,
						};
						return hasSubmission ? (
							<React.Fragment>
								<PubSuspendWhileTyping delay={1000}>
									{() => <SpubHeader {...modeProps} />}
								</PubSuspendWhileTyping>
								<PubDocument {...modeProps} />
							</React.Fragment>
						) : (
							<React.Fragment>
								<PubSuspendWhileTyping delay={1000}>
									{() => <PubHeader {...modeProps} />}
								</PubSuspendWhileTyping>

								<PubDocument {...modeProps} />
							</React.Fragment>
						);
					}}
				</PubSyncManager>
			</div>
		</PubSuspendWhileTypingProvider>
	);
};
export default Pub;
