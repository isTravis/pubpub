import React, { useState } from 'react';
import { Button, Classes } from '@blueprintjs/core';

import {
	DatePicker,
	DownloadChooser,
	SettingsSection,
	ImageUpload,
	InputField,
	PubAttributionEditor,
	PubCollectionsListing,
	FacetEditor,
	TitleEditor,
	Deposit,
} from 'components';
import { DepositTarget, Pub, PubWithCollections } from 'types';
import { apiFetch } from 'client/utils/apiFetch';
import { slugifyString } from 'utils/strings';
import { usePageContext, usePendingChanges } from 'utils/hooks';
import { getDashUrl } from 'utils/dashboard';
import { pubUrl } from 'utils/canonicalUrls';
import { usePersistableState } from 'client/utils/usePersistableState';

import { useFacetsQuery } from 'client/utils/useFacets';
import LabelWithInfo from '../LabelWithInfo';
import DeletePub from './DeletePub';
import DashboardSettingsFrame, { Subtab } from '../DashboardSettingsFrame';

type Props = {
	settingsData: {
		pubData: PubWithCollections;
		depositTarget?: DepositTarget;
	};
};

const PubSettings = (props: Props) => {
	const { settingsData } = props;
	const { scopeData, communityData, featureFlags } = usePageContext();
	const { pendingPromise } = usePendingChanges();
	const {
		activePermissions: { canAdminCommunity, canManage },
	} = scopeData;

	const [collectionPubs, setCollectionPubs] = useState(settingsData.pubData.collectionPubs);
	const {
		state: pubData,
		hasChanges,
		update: updatePubData,
		updatePersistedState: updatePersistedPubData,
		persistedState: persistedPubData,
		persist,
		error,
	} = usePersistableState<Pub>(settingsData.pubData, async (update) => {
		await pendingPromise(apiFetch.put('/api/pubs', { pubId: pubData.id, ...update }));

		if (update.slug && update.slug !== settingsData.pubData.slug) {
			// The setTimeout() gives the usePersistableState hook a chance to disable its
			// onBeforeUnload hook. which triggers a browser popup asking the user if they really
			// want to navigate away.
			setTimeout(() => {
				window.location.href = getDashUrl({
					pubSlug: update.slug,
					mode: 'settings',
				});
			}, 0);
		}
	});
	console.log({
		pubData,
		hasChanges,
		updatePubData,
		updatePersistedPubData,
		persistedPubData,
		persist,
		error,
	});
	const headerBackgroundImage = useFacetsQuery((F) => F.PubHeaderTheme.backgroundImage);

	const slugError = !pubData.slug
		? 'Required'
		: error?.slugStatus === 'used'
		? 'This URL is not available because it is in use by another Pub.'
		: null;

	const renderDetails = () => {
		return (
			<React.Fragment>
				<SettingsSection title="Details" showTitle={false}>
					<InputField label="Title" error={!pubData.title ? 'Required' : null}>
						<TitleEditor
							className={Classes.INPUT}
							initialValue={pubData.htmlTitle ?? pubData.title}
							onInput={(nextHtmlTitle, nextTitle) =>
								updatePubData({ htmlTitle: nextHtmlTitle, title: nextTitle })
							}
						/>
					</InputField>
					<InputField
						label="Link"
						helperText={`Pub will be available at ${pubUrl(communityData, pubData)}`}
						value={pubData.slug}
						onChange={(evt) => updatePubData({ slug: slugifyString(evt.target.value) })}
						error={slugError}
					/>
					<InputField
						label="Custom publication date"
						helperText="If set, this will be shown instead of the first Release date."
					>
						<DatePicker
							// @ts-expect-error ts-migrate(2322) FIXME: Type '{ style: { width: number; }; date: any; onSe... Remove this comment to see the full error message
							style={{ width: 200 }}
							date={pubData.customPublishedAt}
							onSelectDate={(date) =>
								updatePubData({ customPublishedAt: date && date.toUTCString() })
							}
						/>
					</InputField>
					{featureFlags.htmlPubHeaderValues ? (
						<InputField
							label="Description"
							placeholder="Enter description"
							helperText={`${(pubData.description || '').length}/280 characters`}
							error={undefined}
						>
							<TitleEditor
								className={Classes.INPUT}
								initialValue={pubData.htmlDescription ?? pubData.description}
								onInput={(nextHtmlDescription, nextDescription) =>
									updatePubData({
										htmlDescription: nextHtmlDescription,
										description: nextDescription,
									})
								}
								maxLength={280}
							/>
						</InputField>
					) : (
						<InputField
							label="Description"
							placeholder="Enter description"
							helperText={`${(pubData.description || '').length}/280 characters`}
							isTextarea={true}
							value={pubData.description || ''}
							onChange={(evt) =>
								updatePubData({
									description: evt.target.value
										.substring(0, 280)
										.replace(/\n/g, ' '),
								})
							}
							error={undefined}
						/>
					)}
					<ImageUpload
						htmlFor="avatar-upload"
						label={
							<LabelWithInfo
								label="Preview Image"
								info="This image is shown as a preview from Pages and other Pubs."
							/>
						}
						canClear={true}
						key={pubData.avatar}
						defaultImage={pubData.avatar}
						onNewImage={(value) => updatePubData({ avatar: value })}
						width={150}
						helperText={
							<span>
								Suggested minimum dimensions: <br />
								1200px x 800px
							</span>
						}
					/>
					<Button
						disabled={
							!headerBackgroundImage || pubData.avatar === headerBackgroundImage
						}
						onClick={() => updatePubData({ avatar: headerBackgroundImage! })}
					>
						Use header image as preview
					</Button>
				</SettingsSection>
			</React.Fragment>
		);
	};

	const renderLicense = () => {
		return <FacetEditor facetName="License" />;
	};

	const renderTheme = () => {
		return <FacetEditor facetName="PubHeaderTheme" />;
	};

	const renderCitationChooser = () => {
		return <FacetEditor facetName="CitationStyle" />;
	};

	const renderDoi = () => {
		return (
			<SettingsSection title="DOI" showTitle={false}>
				<Deposit
					pub={persistedPubData}
					communityData={communityData}
					updatePub={updatePersistedPubData}
					canIssueDoi={canAdminCommunity}
					depositTarget={settingsData.depositTarget}
				/>
			</SettingsSection>
		);
	};

	const renderAttributions = () => {
		return (
			<SettingsSection title="Attributions" showTitle={false}>
				<PubAttributionEditor
					pubData={pubData}
					communityData={communityData}
					updatePubData={updatePersistedPubData}
					canEdit={canManage}
				/>
			</SettingsSection>
		);
	};

	const renderFormattedDownload = () => {
		return (
			<SettingsSection
				title="Download"
				description={
					<>
						You can add a file that users can download for this Pub, in addition to the
						ones that PubPub automatically generates.
					</>
				}
			>
				<DownloadChooser
					pubData={pubData}
					communityId={communityData.id}
					onSetDownloads={(downloads) => updatePersistedPubData({ downloads })}
				/>
			</SettingsSection>
		);
	};

	const renderCollections = () => {
		return (
			<SettingsSection title="Collections" showTitle={false}>
				<PubCollectionsListing
					pub={pubData}
					allCollections={communityData.collections}
					collectionPubs={collectionPubs}
					updateCollectionPubs={setCollectionPubs}
					canManage={canManage}
				/>
			</SettingsSection>
		);
	};

	const renderDelete = () => {
		return (
			<SettingsSection title="Delete">
				<DeletePub communityData={communityData} pubData={pubData} />
			</SettingsSection>
		);
	};

	const renderNodeLabelEditor = () => {
		return <FacetEditor facetName="NodeLabels" />;
	};

	const renderConnectionsSettings = () => {
		return <FacetEditor facetName="PubEdgeDisplay" />;
	};

	const tabs: Subtab[] = [
		{
			id: 'details',
			title: 'Details',
			icon: 'settings',
			sections: [renderDetails, renderLicense, renderFormattedDownload, renderDelete],
		},
		{
			id: 'look-and-feel',
			title: 'Look & Feel',
			icon: 'palette',
			sections: [
				renderTheme,
				renderCitationChooser,
				renderNodeLabelEditor,
				renderConnectionsSettings,
			],
		},
		{
			id: 'contributors',
			title: 'Contributors',
			pubPubIcon: 'contributor',
			hideSaveButton: true,
			sections: [renderAttributions],
		},
		{
			id: 'collections',
			title: 'Collections',
			pubPubIcon: 'collection',
			hideSaveButton: true,
			sections: [renderCollections],
		},
		{
			id: 'doi',
			title: 'DOI',
			icon: 'barcode',
			hideSaveButton: true,
			sections: [renderDoi],
		},
	];

	return (
		<DashboardSettingsFrame
			tabs={tabs}
			id="pub-settings"
			hasChanges={hasChanges}
			persist={persist}
		/>
	);
};
export default PubSettings;
