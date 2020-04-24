import {Path, PathNode, PathNodeType} from "../types";

export const ROOT_PATH: Path = [];

export function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

export function isPathNode(value: any): value is PathNode {
  return Array.isArray(value)
    && value.length === 2
    && (
      (value[0] === PathNodeType.OBJECT_KEY && typeof value[1] === "string")
      ||
      (value[0] === PathNodeType.ARRAY_INDEX && typeof value[1] === "number")
    );
}

export function isPath(value: any): boolean {
  return Array.isArray(value) && value.every(node => isPathNode(node));
}

function getValue(tree: any, node: PathNode): any {
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

export function getTreeValue(tree: any, path: Path): any {
  let value = tree;

  for (const treeNode of path) {
    value = getValue(value, treeNode);
  }

  if (value === undefined) value = null;

  return value;
}

export function setTreeValue(tree: any, path: Path, value: any): any {
  if (path.length === 0) return value;

  const [frontNode, ...nextPath] = path;

  if (frontNode[0] === PathNodeType.OBJECT_KEY && (!isObject(tree) || tree === undefined)) tree = {};
  if (frontNode[0] === PathNodeType.ARRAY_INDEX && !Array.isArray(tree)) tree = [];

  tree[frontNode[1]] = setTreeValue(tree[frontNode[1]], nextPath, value);
  return tree;
}

export function pathParentOf(a: Path, b: Path): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) {
      return false;
    }
  }
  return true;
}

export function pathEquals(a: Path, b: Path): boolean {
  return a.length === b.length && pathParentOf(a, b);

}

const PATH_STR_REGEX = /([a-zA-Z0-9]+)((?:\[\d+])+)?/;

function mergeArrays<T>(...arrays: T[][]): T[] {
  return arrays.reduce((acc, val) => [...acc, ...val], []);
}

export function pathSelector(selectorStr: string, path: Path = []): Path {
  const selectorPaths: Path[] = selectorStr
    .split(".")
    .map(part => {
      const regexRes = PATH_STR_REGEX.exec(part);
      if (!regexRes || !regexRes[2]) return [[PathNodeType.OBJECT_KEY, part]];
      return [
        ...((regexRes[1] && regexRes[1] !== "") ? [[PathNodeType.OBJECT_KEY, regexRes[1]]] : []) as Path,
        ...regexRes[2].split("[").slice(1).map(item => [PathNodeType.ARRAY_INDEX, Number(item.slice(0, -1))]) as Path
      ];
    });

  return [...path, ...mergeArrays(...selectorPaths)];
}
