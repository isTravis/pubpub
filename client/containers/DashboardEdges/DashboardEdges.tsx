import React, { useCallback, useEffect, useState } from 'react';
import { NonIdealState, Switch, Tab, Tabs } from '@blueprintjs/core';
import { Radio } from '@blueprintjs/core';

import { DashboardFrame } from 'components';
import { usePageContext } from 'utils/hooks';

import DashboardEdgesListing from './DashboardEdgesListing';
import NewEdgeEditor from './NewEdgeEditor';
import { useDashboardEdges } from './useDashboardEdges';
import { apiFetch } from 'client/utils/apiFetch';

require('./dashboardEdges.scss');

type Props = {
	overviewData: {
		pubs: {
			id: string;
			title: string;
			avatar?: string;
		}[];
	};
	pubData: {
		id?: string;
		outboundEdges?: {
			targetPub?: {
				id?: string;
			};
		}[];
		pubEdgeListingDefaultsToCarousel: boolean;
		pubEdgeDescriptionVisible: boolean;
	};
};

const frameDetails = (
	<>
		<p>
			Create & manage relationships between this Pub and other Pubs in your Community or
			publications elsewhere on the internet.
		</p>
		<p>Connection previews will be shown near the header and footer of this Pub's layout.</p>
	</>
);

const DashboardEdges = (props: Props) => {
	const { overviewData, pubData } = props;
	const [showOutboundEmptyState, setShowOutboundEmptyState] = useState(true);
	const {
		scopeData: {
			activePermissions: { canManage: canManageEdges },
		},
	} = usePageContext();

	const {
		inboundEdges,
		outboundEdges,
		addCreatedOutboundEdge,
		reorderOutboundEdges,
		removeOutboundEdge,
		updateInboundEdgeApproval,
	} = useDashboardEdges(pubData);

	const [pubEdgeListingDefaultsToCarousel, setPubEdgeListingDefaultsToCarousel] = useState(
		pubData.pubEdgeListingDefaultsToCarousel,
	);
	const [pubEdgeDescriptionVisible, setPubEdgeDescriptionVisible] = useState(
		pubData.pubEdgeDescriptionVisible,
	);
	const updatePubEdgeListingDefaultsToCarousel = (value: boolean) => {
		setPubEdgeListingDefaultsToCarousel(value);

		apiFetch('/api/pubs', {
			method: 'PUT',
			body: JSON.stringify({
				pubId: pubData.id,
				pubEdgeListingDefaultsToCarousel: value,
			}),
		}).catch(() => setPubEdgeListingDefaultsToCarousel(pubEdgeListingDefaultsToCarousel));
	};
	const updatePubEdgeDescriptionVisible = useCallback(
		(event: React.FormEvent<HTMLInputElement>) => {
			const value = (event.target as HTMLInputElement).checked;

			setPubEdgeDescriptionVisible(value);

			apiFetch('/api/pubs', {
				method: 'PUT',
				body: JSON.stringify({
					pubId: pubData.id,
					pubEdgeDescriptionVisible: value,
				}),
			}).catch(() => setPubEdgeDescriptionVisible(pubEdgeListingDefaultsToCarousel));
		},
		[],
	);

	const renderOutboundEdgesTab = () => {
		const usedPubsIds = [
			pubData.id,
			// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
			...pubData.outboundEdges
				.map((edge) => edge.targetPub && edge.targetPub.id)
				.filter((x) => x),
		];
		return (
			<>
				{canManageEdges && (
					<NewEdgeEditor
						availablePubs={overviewData.pubs}
						// @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined' is not assignable to type 'string... Remove this comment to see the full error message
						usedPubIds={usedPubsIds}
						pubData={pubData}
						onCreateNewEdge={addCreatedOutboundEdge}
						onChangeCreatingState={(isCreating) =>
							setShowOutboundEmptyState(!isCreating)
						}
					/>
				)}
				<DashboardEdgesListing
					// @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
					pubEdges={outboundEdges}
					// @ts-expect-error ts-migrate(2322) FIXME: Type '(sourceIndex: any, destinationIndex: any) =>... Remove this comment to see the full error message
					onReorderEdges={canManageEdges && reorderOutboundEdges}
					// @ts-expect-error ts-migrate(2322) FIXME: Type '(outboundEdge: any) => void' is not assignab... Remove this comment to see the full error message
					onRemoveEdge={canManageEdges && removeOutboundEdge}
					// @ts-expect-error ts-migrate(2322) FIXME: Type 'false' is not assignable to type 'never'.
					isInbound={false}
					// @ts-expect-error ts-migrate(2322) FIXME: Type '() => false | JSX.Element' is not assignable... Remove this comment to see the full error message
					renderEmptyState={() =>
						showOutboundEmptyState && (
							<NonIdealState
								icon="layout-auto"
								title="No connections yet"
								description={
									canManageEdges
										? 'Start typing above to add a new connection.'
										: 'Connections created from this Pub will appear here.'
								}
							/>
						)
					}
				/>
			</>
		);
	};

	const renderInboundEdgesTab = () => {
		return (
			<DashboardEdgesListing
				// @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
				pubEdges={inboundEdges}
				// @ts-expect-error ts-migrate(2322) FIXME: Type '(inboundEdge: any, approvedByTarget: any) =>... Remove this comment to see the full error message
				onUpdateEdgeApproval={canManageEdges && updateInboundEdgeApproval}
				// @ts-expect-error ts-migrate(2322) FIXME: Type 'true' is not assignable to type 'never'.
				isInbound={true}
				// @ts-expect-error ts-migrate(2322) FIXME: Type '() => JSX.Element' is not assignable to type... Remove this comment to see the full error message
				renderEmptyState={() => (
					<NonIdealState
						icon="layout-auto"
						title="No connections from other Pubs"
						description="When other authors add connections to this Pub, they will be listed here."
					/>
				)}
			/>
		);
	};

	return (
		// @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message
		<DashboardFrame
			// @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
			className="dashboard-edges-container"
			// @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
			title="Connections"
			// @ts-expect-error ts-migrate(2322) FIXME: Type 'Element' is not assignable to type 'never'.
			details={frameDetails}
		>
			{canManageEdges && (
				<div className="default-settings">
					<div>
						<span>Show multiple Connections as:</span>
						<Radio
							checked={pubEdgeListingDefaultsToCarousel}
							onChange={() => updatePubEdgeListingDefaultsToCarousel(true)}
							inline
						>
							Carousel
						</Radio>
						<Radio
							checked={!pubEdgeListingDefaultsToCarousel}
							onChange={() => updatePubEdgeListingDefaultsToCarousel(false)}
							inline
						>
							List
						</Radio>
					</div>
					<div>
						<label>
							<Switch
								checked={pubEdgeDescriptionVisible}
								onChange={updatePubEdgeDescriptionVisible}
								inline
							/>
							Show Description by default
						</label>
					</div>
				</div>
			)}
			<Tabs id="pub-dashboard-connections-tabs">
				<Tab
					id="created-by-this-pub"
					panel={renderOutboundEdgesTab()}
					title="Created by this Pub"
				/>
				<Tab
					id="created-by-other-pubs"
					panel={renderInboundEdgesTab()}
					title="Created by other Pubs"
				/>
			</Tabs>
		</DashboardFrame>
	);
};
export default DashboardEdges;
