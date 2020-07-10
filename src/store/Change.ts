import {FormValues} from "./FormValues";
import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

export class Change {
  public readonly path: Path;
  public readonly value: any;

  constructor(path: Path, value: any) {
    this.path = path;
    this.value = value;
  }

  public static fromNewValue(formValues: FormValues, path: Path, value: any): Change {
    let changePath: Path = Path.ROOT;
    let newValueTree = ImmutableValuesTree.EMPTY_OBJECT.set(path, value) as ImmutableValuesTree;

    for (const pathNode of path.nodes) {
      changePath = changePath.add(pathNode);
      newValueTree = newValueTree.follow(new Path([pathNode]));

      if (!formValues.values.has(changePath)) break;
    }

    return new Change(changePath, newValueTree.raw);
  }
}
