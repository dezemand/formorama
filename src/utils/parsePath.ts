import {Path, PathNode, PathNodeType, UnparsedPath, UnparsedPathNode} from "../store/Path";

const PATH_STR_REGEX = /([a-zA-Z0-9]+)((?:\[\d+])+)?/;

function mergeArrays<T>(...arrays: T[][]): T[] {
  return arrays.reduce((acc, val) => [...acc, ...val], []);
}

function isPathNode(value: any): value is PathNode {
  return Array.isArray(value)
    && value.length === 2
    && (
      (value[0] === PathNodeType.OBJECT_KEY && typeof value[1] === "string")
      || (value[0] === PathNodeType.ARRAY_INDEX && typeof value[1] === "number")
    );
}

function isPathNodeArray(value: any): value is PathNode[] {
  return Array.isArray(value) && value.every(node => isPathNode(node));
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
  return isPathNode(node) ? [node] : pathSelector(node);
}

export function parsePath(path: UnparsedPath): Path {
  if (path instanceof Path) {
    return path;
  } else if (isPathNodeArray(path)) {
    return new Path(path);
  } else if (!path || path === "") {
    return Path.ROOT;
  } else if (Array.isArray(path)) {
    return new Path([...mergeArrays(...path.filter(node => node && node !== "").map(node => parsePathNode(node)))]);
  } else {
    return new Path(pathSelector(path));
  }
}
