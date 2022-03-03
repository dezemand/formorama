import { Path } from "./Path";

export class Change {
  public readonly path: Path;
  public readonly value: any;

  constructor(path: Path, value: any) {
    this.path = path;
    this.value = value;
  }

  public static subChanges(changes: Change[], path: Path): Change[] {
    return changes
      .filter((change) => path.parentOf(change.path))
      .map((change) => new Change(change.path.slice(path.nodes.length), change.value));
  }
}
