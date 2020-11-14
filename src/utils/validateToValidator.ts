import {ImmutableValuesTree} from "../store/ImmutableValuesTree";
import {Path} from "../store/Path";
import {FieldError, IValidator, ValidationResult} from "../validation/Validator";

/**
 * This will turn a validateSubmission function into a validator.
 *
 * @param validate
 */
export function validateToValidator<Values>(validate: (values: Values) => any | Promise<any>): IValidator<Values> {
  return {
    async validateSubmission(values: Values): Promise<ValidationResult<Values>> {
      const errors = await validate(values);
      const errorEntries = new ImmutableValuesTree(errors)
        .entries()
        .filter(([, error]) => Boolean(error))
        .map(([path, error]) => [path, [error]]) as FieldError[];

      return {
        valid: errorEntries.length === 0,
        value: values,
        errors: errorEntries,
        path: Path.ROOT
      };
    },
    async validateChange<FieldType>(path: Path, value: FieldType): Promise<ValidationResult<FieldType>> {
      return {
        valid: true,
        value,
        errors: [],
        path
      };
    },
    async validateOnBlur<FieldType>(path: Path, value: FieldType, values: Values): Promise<ValidationResult<FieldType>> {
      const errors = await validate(values);
      const errorTree = new ImmutableValuesTree(errors);
      const fieldErrors = new ImmutableValuesTree(errorTree.get(path))
        .entries()
        .filter(([, error]) => Boolean(error))
        .map(([path, error]) => [path, [error]]) as FieldError[];

      return {
        valid: fieldErrors.length === 0,
        value,
        errors: fieldErrors,
        path
      };
    }
  };
}
