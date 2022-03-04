import { Path } from "../store/Path";

export type ValidationError = string;

export type FieldError = [Path, ValidationError[]];

export interface ValidationResult<ValueType> {
  valid: boolean;
  value: ValueType;
  errors: FieldError[];
  path: Path;
}

export interface IValidator<Values> {
  validateSubmission(values: Values): Promise<ValidationResult<Values>>;

  validateChange<FieldType>(path: Path, value: FieldType, values: Values): Promise<ValidationResult<FieldType>>;

  validateOnBlur<FieldType>(path: Path, value: FieldType, values: Values): Promise<ValidationResult<FieldType>>;
}
