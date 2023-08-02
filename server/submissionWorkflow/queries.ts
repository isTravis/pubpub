import { SubmissionWorkflow } from 'server/models';
import { OmitSequelizeProvidedFields } from 'types/util';
import * as types from 'types';

type CreateFields = OmitSequelizeProvidedFields<types.SubmissionWorkflow>;
type UpdateFields = Partial<CreateFields>;

export const createSubmissionWorkflow = async (props: CreateFields) => {
	const {
		collectionId,
		enabled,
		introText,
		instructionsText,
		receivedEmailText,
		title,
		targetEmailAddresses,
		acceptedText,
		declinedText,
		requireAbstract,
		requireDescription,
	} = props;
	const submissionWorkflow = {
		enabled,
		instructionsText,
		receivedEmailText,
		introText,
		title,
		targetEmailAddresses,
		collectionId,
		acceptedText,
		declinedText,
		requireAbstract,
		requireDescription,
	};
	return SubmissionWorkflow.create(submissionWorkflow);
};

export const updateSubmissionWorkflow = async (update: UpdateFields) => {
	const {
		collectionId,
		enabled,
		instructionsText,
		receivedEmailText,
		introText,
		title,
		targetEmailAddresses,
		acceptedText,
		declinedText,
		requireAbstract,
		requireDescription,
	} = update;
	await SubmissionWorkflow.update(
		{
			enabled,
			instructionsText,
			receivedEmailText,
			targetEmailAddresses,
			introText,
			title,
			acceptedText,
			declinedText,
			requireAbstract,
			requireDescription,
		},
		{ where: { collectionId } },
	);
};

export const destroySubmissionWorkFlow = ({ id }: { id: string }) => {
	return SubmissionWorkflow.destroy({
		where: { id },
	});
};

export const getEnabledSubmissionWorkflowForCollection = (collectionId: string) => {
	return SubmissionWorkflow.findOne({ where: { collectionId, enabled: true } });
};
