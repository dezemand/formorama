import {EventEmitter} from "events";
import {BLUR_EVENT, CHANGE_EVENT, FOCUS_EVENT} from "../events";
import {Change} from "./Change";
import {FormValues} from "./FormValues";
import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

export class FormController<Values = any> extends EventEmitter {
  private values: FormValues<Values> = new FormValues<Values>({} as Values);
  private errors: ImmutableValuesTree = ImmutableValuesTree.EMPTY_OBJECT;
  private focusing: Path | null = null;
  private submitting = false;
  private touched: Path[] = [];

  constructor() {
    super();
  }

  public change(path: Path, value: any): void {
    const changes = this.values.change(path, value);
    this.values = this.values.apply(changes);
    this.emit(CHANGE_EVENT, changes);
  }

  public modify(path: Path, modifier: (values: any) => any): void {
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

  }

  public getValue<T>(path: Path): T {
    return this.values.get(path);
  }

  public getError(path: Path): any {
    return this.errors.get(path);
  }

  public hasTouched(path: Path): any {
    return this.touched.some(fieldPath => fieldPath.equals(path));
  }

  public isFocusing(path: Path | null): boolean {
    return path === null ? this.focusing === null : !!this.focusing && path.equals(this.focusing);
  }
}
