import {Path, PathNode, PathNodeType} from "./Path";

export class ImmutableValuesTree<T = any> {
  public static EMPTY_OBJECT: ImmutableValuesTree<{}> = new ImmutableValuesTree({});
  public static EMPTY_ARRAY: ImmutableValuesTree<[]> = new ImmutableValuesTree([]);

  public readonly raw: T;

  constructor(values: T) {
    this.raw = values;
  }

  /**
   *
   * @param path
   */
  public get(path: Path): any {
    let value: any = this.raw;

    for (const pathNode of path.nodes) {
      value = ImmutableValuesTree.getValue(value, pathNode);
    }

    if (value === undefined) value = null;

    return value;
  }

  /**
   *
   * @param path
   */
  public has(path: Path): boolean {
    return this.get(path) !== null;
  }

  /**
   *
   * @param path
   */
  public follow<T = any>(path: Path): ImmutableValuesTree<T> {
    return new ImmutableValuesTree(this.get(path));
  }

  /**
   *
   * @param path
   * @param value
   */
  public set<T = any>(path: Path, value: any): ImmutableValuesTree<T> {
    if (value instanceof ImmutableValuesTree) {
      value = value.raw;
    }

    return new ImmutableValuesTree(ImmutableValuesTree.setValue(this.raw, value, path.nodes));
  }

  /**
   *
   */
  public entries(): [Path, any][] {
    const entries: [Path, any][] = [];
    ImmutableValuesTree.getEntries(entries, this.raw, Path.ROOT);
    return entries;
  }

  private static getValue(tree: any, node: PathNode): any {
    if (tree === null || tree === undefined) return null;

    switch (node[0]) {
      case PathNodeType.ARRAY_INDEX:
        if (!this.isArray(tree)) throw new Error("Can't access non-array");
        return tree[node[1]];
      case PathNodeType.OBJECT_KEY:
        if (!this.isObject(tree)) throw new Error("Can't access non-object");
        return tree[node[1]];
    }
  }

  private static setValue(tree: any, value: any, nodes: PathNode[]): any {
    if (nodes.length === 0) return value;

    const [frontNode, ...nextNodes] = nodes;

    switch (frontNode[0]) {
      case PathNodeType.ARRAY_INDEX:
        const arrValues = this.isArray(tree) ? [...tree] : [];
        arrValues[frontNode[1]] = this.setValue(arrValues[frontNode[1]], value, nextNodes);
        return arrValues.filter(value => value !== undefined);
      case PathNodeType.OBJECT_KEY:
        const objValues = this.isObject(tree) ? {...tree} : {};
        objValues[frontNode[1]] = this.setValue(objValues[frontNode[1]], value, nextNodes);
        return objValues;
    }
  }

  private static isArray(value: any): value is Array<any> {
    return Array.isArray(value);
  }

  private static isObject(value: any): boolean {
    return typeof value === "object"
      && value !== null
      && !this.isArray(value)
      && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
  }

  private static getEntries(entries: [Path, any][], values: any, path: Path): void {
    if (this.isArray(values)) {
      values.forEach((value, index) => this.getEntries(entries, value, path.add([PathNodeType.ARRAY_INDEX, index])));
    } else if (this.isObject(values)) {
      Object.entries(values).forEach(([key, value]) => this.getEntries(entries, value, path.add([PathNodeType.OBJECT_KEY, key])));
    } else {
      entries.push([path, values]);
    }
  }
}
