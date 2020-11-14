import {ImmutableValuesTree} from "./ImmutableValuesTree";
import {Path} from "./Path";

interface TestValues {
  a: string;
  b?: string;
  c: { d: number }[];
  e: { f: string };
}

let testValues: TestValues;
let testTree: ImmutableValuesTree<TestValues>;

beforeEach(() => {
  testValues = {
    a: "value 1",
    b: "value 2",
    c: [{d: 1}, {d: 2}],
    e: {
      f: "value 3"
    }
  };
  testTree = new ImmutableValuesTree<TestValues>(testValues);
});

test("Constructor works", () => {
  const tree = new ImmutableValuesTree(testValues);

  expect(tree.raw).toEqual(testValues);
});

test("EMPTY_ARRAY is present", () => {
  const tree = ImmutableValuesTree.EMPTY_ARRAY;

  expect(tree).toBeInstanceOf(ImmutableValuesTree);
  expect(tree.raw).toEqual([]);
});

test("EMPTY_OBJECT is present", () => {
  const tree = ImmutableValuesTree.EMPTY_OBJECT;

  expect(tree).toBeInstanceOf(ImmutableValuesTree);
  expect(tree.raw).toEqual({});
});

test("Getting a normal value", () => {
  const path = Path.parse("a");

  expect(testTree.get(path)).toBe("value 1");
});

test("Getting an array value", () => {
  const path = Path.parse("c");

  expect(testTree.get(path)).toEqual([{d: 1}, {d: 2}]);
});

test("Getting an object value", () => {
  const path = Path.parse("e");

  expect(testTree.get(path)).toEqual({f: "value 3"});
});

test("Getting a deep value", () => {
  const path = Path.parse("c[1].d");

  expect(testTree.get(path)).toBe(2);
});

test("Getting object values from arrays does not work", () => {
  const path = Path.parse("c.d");

  expect(() => {
    testTree.get(path);
  }).toThrow();
});

test("Getting array values from objects does not work", () => {
  const path = Path.parse("e[0]");

  expect(() => {
    testTree.get(path);
  }).toThrow();
});

test("Setting a new value", () => {
  interface TestValues2 extends TestValues {
    g: string
  }

  const path = Path.parse("g");

  const newTree = testTree.set<TestValues2>(path, "new value");

  expect(newTree.get(path)).toBe("new value");
  expect(newTree.raw.g).toBe("new value");
});

test("Overwriting a value", () => {
  const path = Path.parse("a");

  const newTree = testTree.set<TestValues>(path, "new value");

  expect(newTree.get(path)).toBe("new value");
  expect(newTree.raw.a).toBe("new value");
});

test("Setting a deep value", () => {
  const path = Path.parse("c[1].d");

  const newTree = testTree.set<TestValues>(path, 42);

  expect(newTree.get(path)).toBe(42);
  expect(newTree.raw.c[1].d).toBe(42);
});

test("Adding an item to the array", () => {
  const path = Path.parse("c[2].d");

  const newTree = testTree.set<TestValues>(path, 42);

  expect(newTree.get(path)).toBe(42);
  expect(newTree.raw.c[2].d).toBe(42);
  expect(newTree.raw.c.length).toBe(3);
});

test("Creating a deep tree value", () => {
  interface TestValues3 extends TestValues {
    g: { h: { i: { j: string }[] } }
  }

  const path = Path.parse("g.h.i[3].j");

  const newTree = testTree.set<TestValues3>(path, "new value");

  expect(newTree.get(path)).toBe("new value");
  expect(newTree.raw.g.h.i[3].j).toBe("new value");
});

test("Set works with a tree", () => {
  interface TestValues4 extends TestValues {
    g: { something: string }
  }

  const otherTree = new ImmutableValuesTree<TestValues4["g"]>({something: "value"});
  const path = Path.parse("g");

  const newTree = testTree.set<TestValues4>(path, otherTree);

  expect(newTree.get(path)).toEqual({something: "value"});
  expect(newTree.raw.g).toEqual({something: "value"});
  expect(newTree.raw.g).not.toBeInstanceOf(ImmutableValuesTree);
});

test("Has works", () => {
  expect(testTree.has(Path.parse("a"))).toBe(true);
  expect(testTree.has(Path.parse("c[1].d"))).toBe(true);
  expect(testTree.has(Path.parse("g"))).toBe(false);
  expect(testTree.has(Path.parse("c[2].d"))).toBe(false);
  expect(testTree.has(Path.parse("somewhere.else.very.deep"))).toBe(false);
});

test("Follow works", () => {
  const path = Path.parse("c");

  const followed = testTree.follow<TestValues["c"]>(path);

  expect(followed.raw).toEqual([{d: 1}, {d: 2}]);
});

test("Entries works", () => {
  expect(testTree.entries()).toEqual([
    [Path.parse("a"), "value 1"],
    [Path.parse("b"), "value 2"],
    [Path.parse("c[0].d"), 1],
    [Path.parse("c[1].d"), 2],
    [Path.parse("e.f"), "value 3"]
  ]);
});

test("Can create from entries", () => {
  const newTree = ImmutableValuesTree.fromEntries([
    [Path.parse("a"), "value 1"],
    [Path.parse("b"), "value 2"],
    [Path.parse("c[0].d"), 1],
    [Path.parse("c[1].d"), 2],
    [Path.parse("e.f"), "value 3"]
  ]);

  expect(newTree.raw).toEqual({
    a: "value 1",
    b: "value 2",
    c: [{d: 1}, {d: 2}],
    e: {
      f: "value 3"
    }
  });
});

test("Putting a tree's entries in fromEntries results in the same tree", () => {
  const entries = testTree.entries();
  const newTrees = ImmutableValuesTree.fromEntries(entries);

  expect(newTrees.raw).toEqual(testTree.raw);
});

test("Comparing trees works", () => {
  interface TestValues2 extends TestValues {
    g: string
  }

  const otherTree = new ImmutableValuesTree<TestValues2>({
    a: "value 1",
    c: [{d: 1}],
    e: {
      f: "changed value"
    },
    g: "added value"
  });

  const changes = testTree.compare(otherTree);

  expect(changes.length).toBe(4);
  expect(changes).toContainEqual([Path.parse("b"), null]);
  expect(changes).toContainEqual([Path.parse("c[1].d"), null]);
  expect(changes).toContainEqual([Path.parse("e.f"), "changed value"]);
  expect(changes).toContainEqual([Path.parse("g"), "added value"]);
});

test("Comparing works the other way around too", () => {
  interface TestValues2 extends TestValues {
    g: string
  }

  const otherTree = new ImmutableValuesTree<TestValues2>({
    a: "value 1",
    c: [{d: 1}],
    e: {
      f: "changed value"
    },
    g: "added value"
  });

  const changes = otherTree.compare(testTree);

  expect(changes.length).toBe(4);
  expect(changes).toContainEqual([Path.parse("b"), "value 2"]);
  expect(changes).toContainEqual([Path.parse("c[1].d"), 2]);
  expect(changes).toContainEqual([Path.parse("e.f"), "value 3"]);
  expect(changes).toContainEqual([Path.parse("g"), null]);
});

test("Works with primary types", () => {
  const tree = new ImmutableValuesTree<string>("value 1");

  expect(tree.raw).toBe("value 1");
  expect(tree.get(Path.ROOT)).toBe("value 1");

  const newTree = tree.set(Path.ROOT, "value 2");

  expect(newTree.raw).toBe("value 2");
  expect(newTree.get(Path.ROOT)).toBe("value 2");
});

test("Works with changing primary type to an object", () => {
  const tree = new ImmutableValuesTree<string>("value 1");
  const newTree = tree.set(Path.parse("a.b"), "value 2");

  expect(newTree.raw).toEqual({a: {b: "value 2"}});
  expect(newTree.get(Path.parse("a.b"))).toBe("value 2");
});

test("BUG: When comparing, root should not appear as null if it's not unset", () => {
  const tree = new ImmutableValuesTree(null);
  const otherTree = new ImmutableValuesTree([{d: 1}, {d: 2}]);

  const changes1 = tree.compare(otherTree);
  const changes2 = otherTree.compare(tree);

  expect(changes1).not.toContainEqual([Path.ROOT, null]);
  expect(changes2).toContainEqual([Path.ROOT, null]);
});
