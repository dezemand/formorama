import { Path } from "./Path";
import { FieldError, ValidationError, ValidationResult } from "../validation/Validator";

export class FormErrors {
  public static readonly EMPTY = new FormErrors([]);

  private readonly errors: FieldError[];

  constructor(errors: FieldError[]) {
    this.errors = errors;
  }

  public get(path: Path): ValidationError[] {
    return (this.errors.find(([errorPath]) => errorPath.equals(path)) || [null, []])[1];
  }

  public subErrors(path: Path): FormErrors {
    return new FormErrors(
      this.errors
        .filter(([errorPath]) => path.parentOf(errorPath))
        .map(([errorPath, errors]) => [errorPath.slice(path.nodes.length), errors])
    );
  }

  public compare(nextErrors: FormErrors): FieldError[] {
    const oldErrors = this.errors.filter(([oldPath]) => {
      return !nextErrors.errors.some(([newPath]) => oldPath.equals(newPath));
    });

    const newErrors = nextErrors.errors.filter(([newPath, newErrors]) => {
      return !this.errors.some(([oldPath, oldErrors]) => {
        return oldPath.equals(newPath) && FormErrors.errorsEqual(oldErrors, newErrors);
      });
    });

    return [...(oldErrors.map(([path]) => [path, []]) as FieldError[]), ...newErrors];
  }

  public applyValidationResults(results: ValidationResult<any>[]): FormErrors {
    return new FormErrors(
      results.reduce((errors, result) => FormErrors.applyResult([...errors], result), [...this.errors])
    );
  }

  public set(path: Path, errors: ValidationError[]): FormErrors {
    return new FormErrors(FormErrors.changeError([...this.errors], path, errors));
  }

  private static errorsEqual(errors1: ValidationError[], errors2: ValidationError[]): boolean {
    return errors1.length === errors2.length && errors1.every((error) => errors2.indexOf(error) !== -1);
  }

  private static changeError(errorList: FieldError[], path: Path, errors: ValidationError[]): FieldError[] {
    const pathIndex = errorList.findIndex(([errorPath]) => errorPath.equals(path));
    if (pathIndex === -1) {
      errorList.push([path, errors]);
    } else {
      errorList[pathIndex] = [path, errors];
    }
    return errorList;
  }

  private static applyResult(errors: FieldError[], result: ValidationResult<any>): FieldError[] {
    // Everything starting with result.path is valid
    errors = errors.map(([path, errors]) => {
      return result.path.parentOf(path) ? [path, []] : [path, errors];
    });

    if (!result.valid) {
      // Apply errors
      for (const [errorPath, resultErrors] of result.errors) {
        const fullErrorPath = result.path.concat(errorPath);
        errors = this.changeError(errors, fullErrorPath, resultErrors);
      }
    }

    return errors;
  }
}
