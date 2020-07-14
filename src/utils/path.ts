import {Path, PathNode, PathNodeType, UnparsedPath, UnparsedPathNode} from "../store/Path";

export const ROOT_PATH: PathNode[] = [];

export function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

export function isPathNode(value: any): value is PathNode {
  return Array.isArray(value)
    && value.length === 2
    && (
      (value[0] === PathNodeType.OBJECT_KEY && typeof value[1] === "string")
      || (value[0] === PathNodeType.ARRAY_INDEX && typeof value[1] === "number")
    );
}

export function isPath(value: any): value is PathNode[] {
  return Array.isArray(value) && value.every(node => isPathNode(node));
}

const PATH_STR_REGEX = /([a-zA-Z0-9]+)((?:\[\d+])+)?/;

function mergeArrays<T>(...arrays: T[][]): T[] {
  return arrays.reduce((acc, val) => [...acc, ...val], []);
}

function pathSelector(selectorStr: string, path: PathNode[] = []): PathNode[] {
  const selectorPaths: PathNode[][] = selectorStr
    .split(".")
    .map(part => {
      const regexRes = PATH_STR_REGEX.exec(part);
      if (!regexRes || !regexRes[2]) {
        return [[PathNodeType.OBJECT_KEY, part]];
      }
      return [
        ...((regexRes[1] && regexRes[1] !== "") ? [[PathNodeType.OBJECT_KEY, regexRes[1]]] : []) as PathNode[],
        ...regexRes[2].split("[").slice(1).map(item => [PathNodeType.ARRAY_INDEX, Number(item.slice(0, -1))]) as PathNode[]
      ];
    });

  return [...path, ...mergeArrays(...selectorPaths)];
}

function parsePathNode(node: UnparsedPathNode): PathNode[] {
  if (isPathNode(node)) {
    return [node];
  } else if (!node || node === "") {
    throw new Error(`Could not parse ${node}`);
  } else {
    return pathSelector(node);
  }
}

export function parsePath(path: UnparsedPath): PathNode[] {
  if (path instanceof Path) {
    return path.nodes;
  } else if (isPath(path)) {
    return path;
  } else if (!path || path === "") {
    return ROOT_PATH;
  } else if (Array.isArray(path)) {
    return [...mergeArrays(...path.filter(node => node && node !== "").map(node => {
      return parsePathNode(node);
    }))];
  } else {
    return pathSelector(path);
  }
}
