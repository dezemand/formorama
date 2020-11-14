import {Change} from "./Change";
import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

export class FormValues<Values = any> {
  public readonly values: ImmutableValuesTree<Values>;

  constructor(values: Values) {
    this.values = values instanceof ImmutableValuesTree ? values : new ImmutableValuesTree(values);
  }

  public change(path: Path, value: any): Change[] {
    return this.compare(new FormValues(this.values.set(path, value)));
  }

  public compare(otherValues: FormValues): Change[] {
    return this.values
      .compare(otherValues.values)
      .map(([path, value]) => new Change(path, value));
  }

  public apply<T = any>(changes: Change[]): FormValues<T> {
    let newValues: ImmutableValuesTree = this.values;
    for (const change of changes) {
      newValues = newValues.set(change.path, change.value);
    }
    return new FormValues<T>(newValues.clean().raw);
  }

  public get<T = any>(path: Path): T {
    return this.values.get(path);
  }
}
