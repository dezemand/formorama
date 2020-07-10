import {PathNode, PathNodeType, UnparsedPath} from "../types";
import {parsePath} from "../utils/path";

export class Path {
  public static readonly ROOT = new Path([]);

  public readonly nodes: PathNode[] = [];

  constructor(nodes: PathNode[]) {
    this.nodes = nodes;
  }

  public get isRoot(): boolean {
    return this.nodes.length === 0;
  }

  public get pathString(): string {
    if (this.isRoot) return "<ROOT>";

    const pathStr = this.nodes.map(node => node[0] === PathNodeType.OBJECT_KEY ? `${node[1]}.` : `[${node[1]}].`).join("");
    return pathStr.substr(0, pathStr.length - 1).replace(/\.\[/g, "[");
  }

  public static parse(path: UnparsedPath): Path {
    return new Path(parsePath(path));
  }

  public parentOf(other: Path): boolean {
    for (let i = 0; i < this.nodes.length; i++) {
      if ((this.nodes[i] && !other.nodes[i]) || this.nodes[i][0] !== other.nodes[i][0] || this.nodes[i][1] !== other.nodes[i][1]) {
        return false;
      }
    }
    return true;
  }

  public equals(other: Path): boolean {
    return this === other || (other.nodes.length === this.nodes.length && this.parentOf(other));
  }

  public add(...nodes: PathNode[]): Path {
    return new Path([...this.nodes, ...nodes]);
  }

  public concat(other: Path): Path {
    return this.add(...other.nodes);
  }

  public slice(start?: number, end?: number): Path {
    return new Path([...this.nodes.slice(start, end)]);
  }

  public toString(): string {
    return `[Path: '${this.pathString}']`;
  }
}
