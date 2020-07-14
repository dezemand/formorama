import {Change} from "./Change";
import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

export class FormValues<Values = any> {
  public readonly values: ImmutableValuesTree<Values>;

  constructor(values: Values) {
    this.values = values instanceof ImmutableValuesTree ? values : new ImmutableValuesTree(values);
  }

  public change(path: Path, value: any): Change[] {
    return ImmutableValuesTree.EMPTY_OBJECT
      .set(path, value)
      .entries()
      .map(([path, value]) => new Change(path, value));
  }

  public compare(otherValues: FormValues): Change[] {
    const thisEntries = this.values.entries();
    const otherEntries = otherValues.values.entries();

    const notInThis = otherEntries
      .filter(([otherPath, otherValue]) => !thisEntries.some(([thisPath, thisValue]) => otherPath.equals(thisPath) && otherValue === thisValue));
    const notInOther = thisEntries
      .filter(([thisPath, thisValue]) => !otherEntries.some(([otherPath, otherValue]) => thisPath.equals(otherPath) && thisValue === otherValue));

    const changes = notInThis.map(([path, value]) => new Change(path, value));
    const removedChanges = notInOther
      .filter(([path]) => !changes.some(change => change.path.equals(path)))
      .map(([path]) => new Change(path, null));

    return [...changes, ...removedChanges];
  }

  public apply(changes: Change[]): FormValues {
    let newValues = this.values;
    for (const change of changes) {
      newValues = newValues.set(change.path, change.value);
    }
    return new FormValues(newValues);
  }

  public get<T = any>(path: Path): T {
    return this.values.get(path);
  }
}
