import {PathNode, PathNodeType} from "../types";
import {Path} from "./Path";

export class ImmutableValuesTree<T = any> {
  public static EMPTY_OBJECT: ImmutableValuesTree<{}> = new ImmutableValuesTree({});
  public static EMPTY_ARRAY: ImmutableValuesTree<[]> = new ImmutableValuesTree([]);

  public readonly raw: T;

  constructor(values: T) {
    this.raw = values;
  }

  private static getValue(tree: any, node: PathNode): any {
    if (tree === null || tree === undefined) return null;

    switch (node[0]) {
      case PathNodeType.ARRAY_INDEX:
        if (!Array.isArray(tree)) throw new Error("Can't access non-array");
        return tree[node[1]];
      case PathNodeType.OBJECT_KEY:
        if (typeof tree !== "object") throw new Error("Can't access non-object");
        return tree[node[1]];
    }
  }

  public get(path: Path): any {
    let value: any = this.raw;

    for (const pathNode of path.nodes) {
      value = ImmutableValuesTree.getValue(value, pathNode);
    }

    if (value === undefined) value = null;

    return value;
  }

  public follow(path: Path): ImmutableValuesTree {
    return new ImmutableValuesTree(this.get(path));
  }

  public set(path: Path, value: any): ImmutableValuesTree {
    if (path.nodes.length === 0) {
      return new ImmutableValuesTree(value);
    }

    return ImmutableValuesTree.EMPTY_OBJECT;

    const [frontNode, ...nextNodes] = path.nodes;

    // if (frontNode[0] === PathNodeType.OBJECT_KEY && (!isObject(tree) || tree === undefined)) {
    //   tree = ImmutableValuesTree.EMPTY_OBJECT;
    // }
    // if (frontNode[0] === PathNodeType.ARRAY_INDEX && !Array.isArray(tree)) {
    //   tree = ImmutableValuesTree.EMPTY_ARRAY;
    // }
    //
    // tree[frontNode[1]] = setTreeValue(tree[frontNode[1]], nextPath, value);
    // return tree;

  }

  public has(path: Path): boolean {
    return this.get(path) !== null;
  }
}
