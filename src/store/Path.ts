import {parsePath} from "../utils/parsePath";

/**
 *
 */
export enum PathNodeType {
  OBJECT_KEY,
  ARRAY_INDEX
}

/**
 *
 */
export type PathNode = [PathNodeType.OBJECT_KEY, string] | [PathNodeType.ARRAY_INDEX, number];

/**
 *
 */
export type UnparsedPathNode = PathNode | string;

/**
 *
 */
export type UnparsedPath = Path | PathNode[] | UnparsedPathNode[] | string | null | undefined;

/**
 *
 */
export class Path {
  public static readonly ROOT = new Path([]);

  public readonly nodes: PathNode[] = [];

  constructor(nodes: PathNode[]) {
    this.nodes = nodes;
  }

  /**
   * True if this path is root (contains no nodes).
   */
  public get isRoot(): boolean {
    return this.nodes.length === 0;
  }

  /**
   * Returns a string
   */
  public get pathString(): string {
    if (this.isRoot) return "<ROOT>";

    const pathStr = this.nodes.map(node => node[0] === PathNodeType.OBJECT_KEY ? `${node[1]}.` : `[${node[1]}].`).join("");
    return pathStr.substr(0, pathStr.length - 1).replace(/\.\[/g, "[");
  }

  /**
   *
   * @param other
   */
  public parentOf(other: Path): boolean {
    for (let i = 0; i < this.nodes.length; i++) {
      if ((this.nodes[i] && !other.nodes[i]) || this.nodes[i][0] !== other.nodes[i][0] || this.nodes[i][1] !== other.nodes[i][1]) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @param other
   */
  public equals(other: Path): boolean {
    return this === other || (other.nodes.length === this.nodes.length && this.parentOf(other));
  }

  /**
   *
   * @param nodes
   */
  public add(...nodes: PathNode[]): Path {
    return new Path([...this.nodes, ...nodes]);
  }

  /**
   *
   * @param other
   */
  public concat(other: Path): Path {
    return this.add(...other.nodes);
  }

  /**
   *
   * @param start
   * @param end
   */
  public slice(start?: number, end?: number): Path {
    return new Path([...this.nodes.slice(start, end)]);
  }

  /**
   *
   */
  public toString(): string {
    return `[Path: '${this.pathString}']`;
  }

  /**
   *
   * @param path
   */
  public static parse(path: UnparsedPath): Path {
    return parsePath(path);
  }
}
