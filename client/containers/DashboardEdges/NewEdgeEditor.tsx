import React from 'react';
import { Button, Callout } from '@blueprintjs/core';
import classNames from 'classnames';

import { relationTypeDefinitions, createCandidateEdge, stripMarkupFromString } from 'utils/pubEdge';
import { assert } from 'utils/assert';

import { PubEdge } from 'types';
import { PubEdgeEditor, PubEdgeListingCard } from 'components';
import { MenuButton, MenuItem } from 'components/Menu';

import NewEdgeInput from './NewEdgeInput';
import { RelationTypeName } from 'utils/pubEdge/relations';

require('./newEdgeEditor.scss');

type Props = {
	onCancel: () => unknown;
	onChange: (edge: PubEdge) => unknown;
	onSave: (edge: PubEdge) => Promise<any> | void;
	pubEdgeDescriptionIsVisible: boolean;
	pubEdge: PubEdge | null;
	usedPubIds: string[];
	loading?: boolean;
	error?: string;
	saveButtonLabel?: string;
};

const NewEdgeEditor = (props: Props) => {
	const {
		onChange,
		onCancel,
		onSave,
		pubEdge,
		usedPubIds,
		loading,
		error,
		saveButtonLabel,
		pubEdgeDescriptionIsVisible,
	} = props;

	const currentRelationName =
		pubEdge &&
		relationTypeDefinitions[pubEdge.relationType] &&
		relationTypeDefinitions[pubEdge.relationType].name;

	const handleSelectItem = (item) => {
		const { targetPub, externalPublication, createNewFromUrl } = item;
		if (targetPub) {
			onChange(createCandidateEdge({ targetPub, targetPubId: targetPub.id }));
		} else if (externalPublication) {
			onChange(
				createCandidateEdge({
					externalPublication: {
						...externalPublication,
						description: stripMarkupFromString(externalPublication.description),
					},
				}),
			);
		} else if (createNewFromUrl) {
			onChange(
				createCandidateEdge({
					externalPublication: {
						url: createNewFromUrl,
						contributors: [],
					},
				}),
			);
		}
	};

	const handleEdgeDirectionSwitch = () => {
		assert(pubEdge !== null);
		onChange({
			...pubEdge,
			pubIsParent: !pubEdge.pubIsParent,
		});
	};

	const handleEdgeRelationTypeChange = (relationType: RelationTypeName) => {
		assert(pubEdge !== null);
		onChange({
			...pubEdge,
			relationType,
		});
	};

	const handleCreateEdge = () => {
		assert(pubEdge !== null);
		onSave(pubEdge);
	};

	const renderNewEdgeControls = () => {
		assert(pubEdge !== null);
		const { externalPublication, targetPub } = pubEdge;
		const canCreateEdge = targetPub || (externalPublication && externalPublication.title);
		return (
			<div className="new-edge-controls">
				<div className="controls-row">
					<MenuButton
						aria-label="Select relationship type"
						buttonProps={{
							rightIcon: 'chevron-down',
							// @ts-expect-error ts-migrate(2322) FIXME: Type '{ rightIcon: string; children: string; }' is... Remove this comment to see the full error message
							children: `Type: ${currentRelationName}`,
						}}
					>
						{Object.entries(relationTypeDefinitions).map(
							([relationType, definition]) => {
								const { name } = definition;
								const selected = pubEdge.relationType === relationType;
								return (
									<MenuItem
										text={name}
										onClick={() =>
											handleEdgeRelationTypeChange(
												relationType as RelationTypeName,
											)
										}
										key={relationType}
										icon={selected ? 'tick' : 'blank'}
									/>
								);
							},
						)}
					</MenuButton>
					<Button icon="swap-vertical" onClick={handleEdgeDirectionSwitch}>
						Switch direction
					</Button>
				</div>
				<PubEdgeListingCard
					isInboundEdge={false}
					pubEdge={pubEdge}
					pubEdgeDescriptionIsVisible={pubEdgeDescriptionIsVisible}
					pubEdgeElement={
						externalPublication && (
							<PubEdgeEditor
								pubEdgeDescriptionIsVisible={pubEdgeDescriptionIsVisible}
								externalPublication={externalPublication}
								onUpdateExternalPublication={(update) =>
									onChange({
										...pubEdge,
										externalPublication: { ...externalPublication, ...update },
									})
								}
							/>
						)
					}
				/>
				{error && (
					<Callout intent="warning" className="error-callout">
						There was an error creating this Pub connection.
					</Callout>
				)}
				<div className="controls-row">
					<Button className="cancel-button" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						intent="primary"
						onClick={handleCreateEdge}
						loading={loading}
						disabled={!canCreateEdge}
					>
						{saveButtonLabel ?? 'Add connection'}
					</Button>
				</div>
			</div>
		);
	};

	const renderInputControl = () => {
		return <NewEdgeInput usedPubIds={usedPubIds} onSelectItem={handleSelectItem} />;
	};

	return (
		<div className={classNames('new-edge-editor-component', pubEdge && 'has-new-edge')}>
			<h4>Connection Properties</h4>
			{pubEdge ? renderNewEdgeControls() : renderInputControl()}
		</div>
	);
};
export default NewEdgeEditor;
