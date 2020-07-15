import {EventEmitter} from "events";
import {BLUR_EVENT, CHANGE_EVENT, DO_SUBMIT_EVENT, ERROR_EVENT, FOCUS_EVENT, SUBMITTING_EVENT} from "../events";
import {Change} from "./Change";
import {FormValues} from "./FormValues";
import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

const DEFAULT_MAX_LISTENERS = 2 ** 16;

export interface FormControllerParams<Values> {
  validate?(values: Values): any | Promise<any>;

  maxListeners?: number;
}

export class FormController<Values = any> extends EventEmitter {
  private values: FormValues<Values> = new FormValues<Values>({} as Values);
  private focusing: Path | null = null;
  private touched: Path[] = [];

  constructor(params: FormControllerParams<Values> = {}) {
    super();
    this._params = params;
    this.setMaxListeners(params.maxListeners || DEFAULT_MAX_LISTENERS);
  }

  private _errors: ImmutableValuesTree = ImmutableValuesTree.EMPTY_OBJECT;

  public set errors(errors: ImmutableValuesTree) {
    const filteredErrors = ImmutableValuesTree.fromEntries(errors.entries().filter(([, error]) => Boolean(error)));
    const delta = this._errors.compare(filteredErrors);
    this._errors = filteredErrors;
    this.emit(ERROR_EVENT, delta);
  }

  private _params: FormControllerParams<Values>;

  public set params(params: FormControllerParams<Values>) {
    this._params = params;
    this.setMaxListeners(params.maxListeners || DEFAULT_MAX_LISTENERS);
  }

  private _submitting = false;

  public get submitting(): boolean {
    return this._submitting;
  }

  public set submitting(submitting: boolean) {
    this._submitting = submitting;
    this.emit(SUBMITTING_EVENT, submitting);
  }

  public change(path: Path, value: any): void {
    const changes = this.values.change(path, value);
    this.values = this.values.apply(changes);
    this.emit(CHANGE_EVENT, changes);
  }

  public modify<T>(modifier: (values: T) => T, path: Path = Path.ROOT): void {
    const oldValues = new FormValues(this.values.get(path));
    const newValues = new FormValues(modifier(oldValues.values.raw));
    const changes = oldValues.compare(newValues).map(change => new Change(path.concat(change.path), change.value));
    this.values = this.values.apply(changes);
    this.emit(CHANGE_EVENT, changes);
  }

  public focus(path: Path): void {
    this.focusing = path;
    if (!this.hasTouched(path)) {
      this.touched.push(path);
    }
    this.emit(FOCUS_EVENT, path);
  }

  public blur(path: Path): void {
    if (this.focusing && path.equals(this.focusing)) {
      this.focusing = null;
      this.emit(FOCUS_EVENT, null);
    }
    this.emit(BLUR_EVENT, path);
  }

  public submit(): void {
    this.emit(DO_SUBMIT_EVENT);
  }

  public getValue<T>(path: Path): T {
    return this.values.get(path);
  }

  public getError(path: Path): any {
    return this._errors.get(path);
  }

  public hasTouched(path: Path): boolean {
    return this.touched.some(fieldPath => fieldPath.equals(path));
  }

  public isFocusing(path: Path | null): boolean {
    return path === null ? this.focusing === null : !!this.focusing && path.equals(this.focusing);
  }

  public async validate(): Promise<boolean> {
    if (!this._params.validate) return true;

    const result = await this._params.validate(this.getValue<Values>(Path.ROOT));
    this.errors = new ImmutableValuesTree(result);

    return this._errors.entries().length === 0;
  }
}
