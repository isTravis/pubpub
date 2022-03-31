import React from 'react';
import { InputGroup } from '@blueprintjs/core';
import { useDebouncedCallback } from 'use-debounce';

import { PubPageData, Pub, DocJson, DefinitelyHas, Submission } from 'types';
import { DownloadChooser } from 'components';

import SpubHeaderTab from './SpubHeaderTab';
import SpubHeaderField from './SpubHeaderField';
import AbstractEditor from './AbstractEditor';
import { ValidatedSubmissionFields } from './validate';

type Props = {
	pub: Pub;
	submission: DefinitelyHas<Submission, 'submissionWorkflow'>;
	onUpdatePub: (pub: Partial<PubPageData>) => unknown;
	onUpdateAbstract: (abstract: DocJson) => Promise<unknown>;
	validatedFields: ValidatedSubmissionFields;
};

const DetailsTab = (props: Props) => {
	const {
		pub,
		onUpdatePub,
		onUpdateAbstract,
		validatedFields,
		submission: {
			status,
			abstract,
			submissionWorkflow: { requireAbstract, requireDescription },
		},
	} = props;
	const hasSubmitted = status !== 'incomplete';
	const [onUpdatePubDebounced] = useDebouncedCallback(onUpdatePub, 250);

	return (
		<SpubHeaderTab>
			<SpubHeaderField
				title="Title"
				asLabel
				valid={validatedFields.title}
				invalidNotice="Title must not be empty"
			>
				<InputGroup
					onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
						onUpdatePubDebounced({ title: evt.target.value })
					}
					defaultValue={pub.title}
					fill
				/>
			</SpubHeaderField>
			{requireDescription && (
				<SpubHeaderField
					title="Description"
					instructions="A short subheader that will be shown below your submission's title."
					valid={validatedFields.description}
					invalidNotice="Description must not be empty"
				>
					<InputGroup
						onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
							onUpdatePubDebounced({ description: evt.target.value })
						}
						defaultValue={pub.description}
						fill
						maxLength={280}
					/>
				</SpubHeaderField>
			)}
			{requireAbstract && (
				<SpubHeaderField
					title="Abstract"
					instructions={
						hasSubmitted ? 'Update the abstract from the submission body.' : null
					}
					valid={hasSubmitted || validatedFields.abstract}
					invalidNotice="Abstract must not be empty"
				>
					<AbstractEditor
						isReadOnly={hasSubmitted}
						submissionAbstract={abstract}
						onUpdateAbstract={onUpdateAbstract}
					/>
				</SpubHeaderField>
			)}
			<SpubHeaderField
				title="Attached file"
				instructions={
					<>
						You can upload a file, like a PDF with custom styling, to associate with
						this submission.
					</>
				}
			>
				<DownloadChooser
					pubData={pub}
					communityId={pub.communityId}
					onSetDownloads={onUpdatePub}
					text="Upload new file"
				/>
			</SpubHeaderField>
		</SpubHeaderTab>
	);
};

export default DetailsTab;
