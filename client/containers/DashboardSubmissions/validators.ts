import { DocJson } from 'types';
import { LayoutBlockSubmissionBanner } from 'utils/layout';

type AnyRecord = Record<string, any>;

export type FieldValidator<Field> = (value: Field) => boolean;

export type RecordValidator<Rec extends AnyRecord> = {
	[K in keyof Rec]: FieldValidator<Rec[K]>;
};

export type ValidatedFields<Rec> = { [K in keyof Rec]: boolean };

export type ValidationResult<Rec extends AnyRecord> = {
	isValid: boolean;
	fields: ValidatedFields<Rec>;
};

export const isValidDocJson = (docJson: DocJson) => {
	if (docJson.content.length === 0) {
		return false;
	}
	if (docJson.content.length === 1) {
		const [firstChild] = docJson.content;
		return firstChild.content && firstChild.content.length > 0;
	}
	return true;
};

export const isValidBannerContent = (block: LayoutBlockSubmissionBanner['content']) => {
	const { title, body } = block;
	return title.length > 0 && isValidDocJson(body);
};

export const isAlwaysValid = () => true;

export const validate = <Rec extends AnyRecord>(
	rec: Rec,
	validator: RecordValidator<Rec>,
): ValidationResult<Rec> => {
	const fields = Object.entries(rec).reduce(
		(partial: Partial<ValidatedFields<Rec>>, [key, value]) => {
			const fieldValidator = validator[key];
			return {
				...partial,
				[key]: fieldValidator(value),
			};
		},
		{},
	) as ValidatedFields<Rec>;
	return {
		fields,
		isValid: !Object.values(fields).some((val) => !val),
	};
};
