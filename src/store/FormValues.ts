import {getTreeValue} from "../utils/path";
import {Change} from "./Change";
import {ChangeSet} from "./ChangeSet";
import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

export class FormValues<Values = any> {
  public readonly values: ImmutableValuesTree<Values>;

  constructor(values: Values) {
    this.values = new ImmutableValuesTree(values);
  }

  public change(path: Path, value: any): Change {
    return Change.fromNewValue(this, path, value);
  }

  public compare(otherValues: FormValues): ChangeSet {
    return new ChangeSet();
  }

  public apply(change: Change): FormValues {
    return new FormValues(this.values);
  }

  public subValues(path: Path): FormValues {
    return new FormValues(this.getValue(path));
  }

  public getValue(path: Path): any {
    return getTreeValue(this.values, path.nodes);
  }
}
