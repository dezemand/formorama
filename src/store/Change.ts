import {Path} from "./Path";

export class Change {
  public readonly path: Path;
  public readonly value: any;

  constructor(path: Path, value: any) {
    this.path = path;
    this.value = value;
  }
}
