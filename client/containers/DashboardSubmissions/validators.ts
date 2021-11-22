import { DocJson } from 'types';

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

export const isValidTitle = (title: string) => title.length > 0;

export const isValidDocJson = (docJson: DocJson) => {
	return docJson.content.some((child) => child.content?.length > 0);
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
