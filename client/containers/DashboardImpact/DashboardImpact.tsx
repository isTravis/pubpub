import React, { useCallback, useRef } from 'react';
import { usePageContext } from 'utils/hooks';
import { Button, Intent, Tooltip, Position, PopoverInteractionKind } from '@blueprintjs/core';
import IframeResizer from 'iframe-resizer-react';

import { DashboardFrame, Icon } from 'components';
import LabelWithInfo from '../DashboardSettings/LabelWithInfo';
import { useInfiniteScroll } from 'client/utils/useInfiniteScroll';
import { useInView } from 'client/utils/useInView';

require('./dashboardImpact.scss');

type Props = {
	impactData: {
		baseToken: string;
		benchmarkToken?: string;
		newToken?: string;
	};
};

const useIsInView = (element: HTMLElement | null, offset = 0) => {
	const [isInView, setIsInView] = React.useState(false);
	React.useEffect(() => {
		const handleScroll = () => {
			console.log('scrolling', element);
			if (!element) return;
			const top = element.getBoundingClientRect().top;
			console.log(top);
			setIsInView(top + offset >= 0 && top - offset <= window.innerHeight);
		};
		handleScroll();
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [element]);
	return isInView;
};

const DashboardImpact = (props: Props) => {
	const { impactData } = props;
	const { baseToken, benchmarkToken, newToken } = impactData;
	const { scopeData } = usePageContext();
	const {
		elements: { activeTargetType, activeTargetName, activeTarget },
		activePermissions: { canView },
	} = scopeData;

	const displayDataWarning = activeTarget?.createdAt < '2020-04-29';
	const isCollection = activeTargetType === 'collection';
	const genUrl = (token) => {
		return `https://metabase.pubpub.org/embed/dashboard/${token}#bordered=false&titled=false`;
	};
	const getOffset = (width) => {
		return width < 960 ? 45 : 61;
	};

	const [showNewAnalytics, setShowNewAnalytics] = React.useState(false);
	// const newAnalyticsSection = useRef<HTMLElement>(null);
	// console.log({ newAnalyticsSection });
	// // const isInView = useIsInView(newAnalyticsSection.current, 100);
	// const isInView = useInView(newAnalyticsSection, {
	// 	once: true,
	// 	amount: 1,
	// });

	// console.log(isInView);

	return (
		<DashboardFrame
			title="Impact"
			className="dashboard-impact-container"
			details={`Learn more about who your ${activeTargetName} is reaching.`}
		>
			<section>
				<h3 id="historical_benchmark" className="absolute-header">
					Analytics
					{canView && !isCollection && displayDataWarning && (
						<Tooltip
							content={
								<div className="impact-warning-tooltip">
									Analytics data collected before April 30, 2020 used a different
									analytics system than data collected after April 30, 2020. As a
									result, the Users metric will be inconsistent between these two
									periods, and should not be used for direct comparisons. For more
									information, see our{' '}
									<a
										href="https://discourse.knowledgefutures.org/t/user-metric-discrepancies-between-july-12-2019-and-april-30-2020/259"
										target="_blank"
										rel="noopener noreferrer"
									>
										explanatory Discourse post
									</a>{' '}
									and the{' '}
									<a href="#historical_benchmark">
										Historical Benchmark Dashboard
									</a>
									, below.
								</div>
							}
							hoverCloseDelay={300}
							intent={Intent.WARNING}
							position={Position.BOTTOM_LEFT}
							interactionKind={PopoverInteractionKind.HOVER}
						>
							<Button
								className="warning-button"
								intent={Intent.WARNING}
								icon="warning-sign"
								minimal
							/>
						</Tooltip>
					)}
				</h3>
				{canView ? (
					<IframeResizer
						className="metabase main"
						src={genUrl(baseToken)}
						title="Analytics"
						frameBorder="0"
						onResized={({ iframe, height, width }) => {
							/* eslint-disable-next-line no-param-reassign */
							iframe.style.height = `${height - getOffset(width)}px`;
						}}
					/>
				) : (
					<p></p>
				)}
			</section>
			<section>
				{newToken && canView && (
					<>
						<h3 id="historical_benchmark_new" className="absolute-header">
							{!isCollection && displayDataWarning && (
								<LabelWithInfo
									info={`These analytics are collected using a new system that was implemented in March 2024.
									They do not map directly to the historical analytics system, but should be close.
									In the near future the old system will stop collecting data, and the new system will be the only source of analytics. We will provide a way to view both the old and new data side by side for a period of time, after which we will work on migrating the old data to the new system.
								`}
									label="New Analytics"
								/>
							)}
						</h3>
						<IframeResizer
							className="metabase new"
							src={genUrl(newToken)}
							title="New Analytics"
							frameBorder="0"
							onResized={({ iframe, height, width }) => {
								/* eslint-disable-next-line no-param-reassign */
								iframe.style.height = `${height - getOffset(width)}px`;
							}}
						/>
					</>
				)}
			</section>
			<section>
				{canView && displayDataWarning && (
					<React.Fragment>
						<h3 id="historical_benchmark" className="absolute-header">
							Historical User Benchmark
							<Tooltip
								content={
									<div className="impact-warning-tooltip">
										This dashboard shows the historical user metric (prior to
										April 30, 2020) graphed against the new user metric during
										an overlap period, for making comparisons between the two.
										For more information, see our{' '}
										<a
											href="https://discourse.knowledgefutures.org/t/user-metric-discrepancies-between-july-12-2019-and-april-30-2020/259"
											target="_blank"
											rel="noopener noreferrer"
										>
											explanatory Discourse post
										</a>
									</div>
								}
								hoverCloseDelay={300}
								intent={Intent.WARNING}
								position={Position.BOTTOM_LEFT}
								interactionKind={PopoverInteractionKind.HOVER}
							>
								<Button
									className="warning-button"
									intent={Intent.WARNING}
									icon="warning-sign"
									minimal
								/>
							</Tooltip>
						</h3>
						<IframeResizer
							className="metabase benchmark"
							src={genUrl(benchmarkToken)}
							title="Benchmark"
							frameBorder="0"
							onResized={({ iframe, height, width }) => {
								/* eslint-disable-next-line no-param-reassign */
								iframe.style.height = `${height - getOffset(width)}px`;
							}}
						/>
					</React.Fragment>
				)}
			</section>
		</DashboardFrame>
	);
};
export default DashboardImpact;
