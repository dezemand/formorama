import {Path, PathNodeType} from "./Path";

test("Constructor works", () => {
  const path = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.ARRAY_INDEX, 1], [PathNodeType.OBJECT_KEY, "c"]]);

  expect(path.nodes).toEqual([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.ARRAY_INDEX, 1], [PathNodeType.OBJECT_KEY, "c"]]);
});

test("Path.ROOT is available", () => {
  const root = Path.ROOT;

  expect(root).toBeInstanceOf(Path);
  expect(root.nodes).toEqual([]);
  expect(root.isRoot).toBe(true);
});

test("Empty path nodes is root", () => {
  const path = new Path([]);

  expect(path.isRoot).toBe(true);
});

test("Parse path 'a.b.c.d'", () => {
  const parsedPath = Path.parse("a.b.c.d");

  expect(parsedPath.nodes).toEqual([
    [PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"],
    [PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"]
  ]);
});

test("Equal paths", () => {
  const path1 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"]]);
  const path2 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"]]);

  expect(path1.equals(path2)).toBe(true);
  expect(path2.equals(path1)).toBe(true);
  expect(path1.nodes).toEqual(path2.nodes);
});

test("Not equal paths, different lengths", () => {
  const path1 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"]]);
  const path2 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"]]);

  expect(path1.equals(path2)).toBe(false);
  expect(path2.equals(path1)).toBe(false);
  expect(path1.nodes).not.toEqual(path2.nodes);
});

test("Not equal paths, same lengths", () => {
  const path1 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"]]);
  const path2 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "d"]]);

  expect(path1.equals(path2)).toBe(false);
  expect(path2.equals(path1)).toBe(false);
  expect(path1.nodes).not.toEqual(path2.nodes);
});

test("Creating a path string", () => {
  const path = new Path([
    [PathNodeType.OBJECT_KEY, "a"], [PathNodeType.ARRAY_INDEX, 1],
    [PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"],
    [PathNodeType.ARRAY_INDEX, 2], [PathNodeType.ARRAY_INDEX, 0]]
  );

  expect(path.pathString).toBe("a[1].c.d[2][0]");
});

test("Parsing a path string returns the same path", () => {
  const path = new Path([
    [PathNodeType.OBJECT_KEY, "a"], [PathNodeType.ARRAY_INDEX, 1],
    [PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"],
    [PathNodeType.ARRAY_INDEX, 2], [PathNodeType.ARRAY_INDEX, 0]
  ]);
  const parsedPath = Path.parse(path.pathString);

  expect(path.equals(parsedPath)).toBe(true);
  expect(parsedPath.equals(path)).toBe(true);
});

test("Parent of works", () => {
  const path1 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"]]);
  const path2 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"]]);

  expect(path1.parentOf(path2)).toBe(true);
  expect(path2.parentOf(path1)).toBe(false);
});

test("Adding works", () => {
  const path = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"]]);
  const addedPath = path.add([PathNodeType.ARRAY_INDEX, 1], [PathNodeType.OBJECT_KEY, "c"]);

  const fullPath = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.ARRAY_INDEX, 1], [PathNodeType.OBJECT_KEY, "c"]]);

  expect(addedPath.equals(fullPath)).toBe(true);
  expect(addedPath.nodes).toEqual(fullPath.nodes);
});

test("Concatting paths works", () => {
  const path1 = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"]]);
  const path2 = new Path([[PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"]]);

  const fullPath = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"]]);

  const concatenatedPath = path1.concat(path2);

  expect(concatenatedPath.equals(fullPath)).toBe(true);
  expect(concatenatedPath.nodes).toEqual(fullPath.nodes);
});

test("Slicing paths works", () => {
  const path = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.OBJECT_KEY, "b"], [PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"]]);

  const slicedPath = path.slice(1, 2);

  expect(slicedPath.equals(new Path([[PathNodeType.OBJECT_KEY, "b"]]))).toBe(true);
});

test("toString works", () => {
  const path = new Path([[PathNodeType.OBJECT_KEY, "a"], [PathNodeType.ARRAY_INDEX, 1], [PathNodeType.OBJECT_KEY, "c"], [PathNodeType.OBJECT_KEY, "d"], [PathNodeType.ARRAY_INDEX, 2], [PathNodeType.ARRAY_INDEX, 0]]);

  expect(path.toString()).toBe("[Path: 'a[1].c.d[2][0]']");
  expect(String(path)).toBe("[Path: 'a[1].c.d[2][0]']");
});
