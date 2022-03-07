import { BLUR_EVENT, CHANGE_EVENT, DO_SUBMIT_EVENT, ERROR_EVENT, FOCUS_EVENT, SUBMITTING_EVENT } from "../events";
import { BaseEventMap, EventEmitter } from "../utils/eventemitter";
import { validateToValidator } from "../utils/validateToValidator";
import { FieldError, IValidator, ValidationError } from "../validation/Validator";
import { Change } from "./Change";
import { FormErrors } from "./FormErrors";
import { FormValues } from "./FormValues";
import { Path } from "./Path";

interface NormalFormControllerParams {}

interface FormControllerParamsWithLegacyValidate<Values> extends NormalFormControllerParams {
  validate(values: Values): any | Promise<any>;
}

interface FormControllerParamsWithValidator<Values> extends NormalFormControllerParams {
  validator: IValidator<Values>;
}

export type FormControllerParams<Values> =
  | NormalFormControllerParams
  | FormControllerParamsWithLegacyValidate<Values>
  | FormControllerParamsWithValidator<Values>;

function hasValidator<Values>(
  params: FormControllerParams<Values>
): params is FormControllerParamsWithValidator<Values> {
  return (params as FormControllerParamsWithValidator<Values>).validator !== undefined;
}

function hasValidation<Values>(
  params: FormControllerParams<Values>
): params is FormControllerParamsWithLegacyValidate<Values> {
  return (params as FormControllerParamsWithLegacyValidate<Values>).validate !== undefined;
}

export interface FormControllerEvents extends BaseEventMap {
  [CHANGE_EVENT]: [Change[]];
  [DO_SUBMIT_EVENT]: [];
  [SUBMITTING_EVENT]: [boolean];
  [FOCUS_EVENT]: [Path | null];
  [BLUR_EVENT]: [Path];
  [ERROR_EVENT]: [FieldError[]];
}

export class FormController<Values = any> extends EventEmitter<FormControllerEvents> {
  private values: FormValues<Values> = new FormValues<Values>({} as Values);
  private touched: Path[] = [];
  private validator: IValidator<Values> | null = null;

  constructor(params: FormControllerParams<Values> = {}) {
    super();
    this.params = params;
  }

  private _errors: FormErrors = FormErrors.EMPTY;

  public set errors(errors: FormErrors) {
    const delta = this._errors.compare(errors);
    this._errors = errors;
    if (delta.length > 0) {
      this.emit(ERROR_EVENT, delta);
    }
  }

  public set params(params: FormControllerParams<Values>) {
    this.validator = hasValidator(params)
      ? params.validator
      : hasValidation(params)
      ? validateToValidator(params.validate)
      : null;
  }

  private _submitting = false;

  public get submitting(): boolean {
    return this._submitting;
  }

  public set submitting(submitting: boolean) {
    this._submitting = submitting;
    this.emit(SUBMITTING_EVENT, submitting);
  }

  private _focusing: Path | null = null;

  private get focusing(): Path | null {
    return this._focusing;
  }

  private set focusing(path: Path | null) {
    const oldFocus = this._focusing;

    if ((oldFocus === null && path === null) || (oldFocus !== null && path !== null && oldFocus.equals(path))) {
      return;
    }

    if (oldFocus) {
      this.emit(BLUR_EVENT, oldFocus);
      this.validateBlur(oldFocus).catch(() => void 0);
    }

    this._focusing = path;

    if (path && !this.hasTouched(path)) {
      this.touched.push(path);
    }

    this.emit(FOCUS_EVENT, path);
  }

  public async change(path: Path, value: any): Promise<void> {
    const changes = this.values.change(path, value);
    this.values = this.values.apply(changes);
    this.emit(CHANGE_EVENT, changes);
    await this.validateChanges(changes);
  }

  public changeErrors(path: Path, errors: ValidationError[]): void {
    this.errors = this._errors.set(path, errors);
  }

  public modify<T>(modifier: (values: T) => T, path: Path = Path.ROOT): void {
    const oldValues = new FormValues(this.values.get(path));
    const newValues = new FormValues(modifier(oldValues.values.raw));
    const changes = oldValues.compare(newValues).map((change) => new Change(path.concat(change.path), change.value));
    this.values = this.values.apply(changes);
    this.emit(CHANGE_EVENT, changes);
    this.validateChanges(changes);
  }

  public focus(path: Path): void {
    this.focusing = path;
  }

  public blur(path: Path): void {
    if (this.focusing && path.equals(this.focusing)) {
      this.focusing = null;
    }
  }

  public submit(): void {
    this.emit(DO_SUBMIT_EVENT);
  }

  public getValue<T>(path: Path): T {
    return this.values.get(path);
  }

  public getErrors(path: Path): ValidationError[] {
    return this._errors.get(path);
  }

  public hasTouched(path: Path): boolean {
    return this.touched.some((fieldPath) => fieldPath.equals(path));
  }

  public isFocusing(path: Path | null): boolean {
    return path === null ? this.focusing === null : !!this.focusing && path.equals(this.focusing);
  }

  public async validateSubmission(): Promise<boolean> {
    if (this.validator === null) {
      return true;
    }
    const result = await this.validator.validateSubmission(this.values.get(Path.ROOT));
    this.errors = this._errors.applyValidationResults([result]);
    return result.valid;
  }

  private async validateChanges(changes: Change[]): Promise<void> {
    if (this.validator === null) {
      return;
    }
    const values = this.values.get(Path.ROOT);
    const results = await Promise.all(
      changes.map((change) => this.validator!.validateChange(change.path, change.value, values))
    );
    this.errors = this._errors.applyValidationResults(results);
  }

  private async validateBlur(path: Path): Promise<void> {
    if (this.validator === null) {
      return;
    }
    const result = await this.validator.validateOnBlur(path, this.values.get(path), this.values.get(Path.ROOT));
    this.errors = this._errors.applyValidationResults([result]);
  }
}
