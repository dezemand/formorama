import {Change} from "./Change";
import {FormValues} from "./FormValues";
import {Path, PathNodeType} from "./Path";

interface TestValues {
  a: string;
  b?: string;
  c: { d: number }[];
  e: { f: string };
}

let testObject: TestValues;
let testValues: FormValues<TestValues>;

beforeEach(() => {
  testObject = {
    a: "value 1",
    b: "value 2",
    c: [{d: 1}, {d: 2}],
    e: {
      f: "value 3"
    }
  };
  testValues = new FormValues<TestValues>(testObject);
});

test("Constructor works", () => {
  const values = new FormValues(testObject);

  expect(values.values.raw).toEqual(testObject);
  expect(values.get(Path.ROOT)).toEqual(testObject);
});

test("Changing a value", () => {
  const changes = testValues.change(Path.parse("a"), "new value");

  expect(changes.length).toBe(1);
  expect(changes).toContainEqual(new Change(Path.parse("a"), "new value"));
});

test("Changing a deep value", () => {
  const changes = testValues.change(Path.parse("c[1].d"), 42);

  expect(changes.length).toBe(1);
  expect(changes).toContainEqual(new Change(Path.parse("c[1].d"), 42));
});

test("Adding a value to an array", () => {
  const changes = testValues.change(Path.parse("c[2].d"), 42);

  expect(changes.length).toBe(1);
  expect(changes).toContainEqual(new Change(Path.parse("c[2].d"), 42));
});

test("Comparing to different values", () => {
  const otherValues = new FormValues<TestValues>({
    a: "different",
    c: [{d: 0}, {d: 2}, {d: 3}],
    e: {
      f: "value 3"
    }
  });

  const changes = testValues.compare(otherValues);

  expect(changes.length).toBe(4);
  expect(changes).toContainEqual(new Change(Path.parse("a"), "different"));
  expect(changes).toContainEqual(new Change(Path.parse("c[0].d"), 0));
  expect(changes).toContainEqual(new Change(Path.parse("c[2].d"), 3));
  expect(changes).toContainEqual(new Change(Path.parse("b"), null));
});

test("Applying a change", () => {
  const changes = [new Change(Path.parse("a"), "new value")];

  const newValues = testValues.apply(changes);

  expect(newValues.values.get(Path.parse("a"))).toBe("new value");
  expect(newValues.get(Path.parse("a"))).toBe("new value");
});

test("Applying a deep change", () => {
  const changes = [new Change(Path.parse("c[1].d"), 42)];

  const newValues = testValues.apply(changes);

  expect(newValues.values.get(Path.parse("c[1].d"))).toBe(42);
  expect(newValues.get(Path.parse("c[1].d"))).toBe(42);
});

test("Applying multiple changes", () => {
  const changes = [
    new Change(Path.parse("c[0].d"), 42),
    new Change(Path.parse("c[1].d"), 43),
    new Change(Path.parse("b"), "new value")
  ];

  const newValues = testValues.apply(changes);

  expect(newValues.get(Path.ROOT)).toEqual({
    a: "value 1",
    b: "new value",
    c: [{d: 42}, {d: 43}],
    e: {
      f: "value 3"
    }
  });
});

test("Applying no changes", () => {
  const newValues = testValues.apply([]);

  expect(newValues.get(Path.ROOT)).toEqual(testObject);
});

test("Works with primary types", () => {
  const values = new FormValues<string>("value 1");

  expect(values.get(Path.ROOT)).toBe("value 1");
});

test("Changes work with primary types", () => {
  const values = new FormValues<string>("value 1");
  const changes = [new Change(Path.ROOT, "value 2")];

  const newValues = values.apply(changes);

  expect(newValues.get(Path.ROOT)).toBe("value 2");
});

test("Creating sub changes", () => {
  interface TestValues2 extends TestValues {
    e: {
      f: string;
      g: string;
    };
  }

  const newValues = new FormValues<TestValues2>({
    ...testObject,
    a: "changed but not relevant",
    e: {f: "changed value", g: "new value"}
  });

  const changes = testValues.compare(newValues);
  const subChanges = Change.subChanges(changes, Path.parse("e"));

  expect(subChanges.length).toBe(2);
  expect(subChanges).toContainEqual(new Change(Path.parse("f"), "changed value"));
  expect(subChanges).toContainEqual(new Change(Path.parse("g"), "new value"));
});

test("Applying sub changes", () => {
  interface TestValues2 extends TestValues {
    e: {
      f: string;
      g: string;
    };
  }

  const newValues = new FormValues<TestValues2>({
    ...testObject,
    a: "changed but not relevant",
    e: {f: "changed value", g: "new value"}
  });
  const subValues = new FormValues<TestValues["e"]>(testObject.e);
  const changes = testValues.compare(newValues);
  const subChanges = Change.subChanges(changes, Path.parse("e"));

  const newSubValues = subValues.apply<TestValues2["e"]>(subChanges);

  expect(newSubValues.get(Path.ROOT)).toEqual({f: "changed value", g: "new value"});
});

test("Remove last item", () => {
  const newValues = new FormValues({...testObject, c: [{d: 2}]});
  const changes = testValues.compare(newValues);

  const changedValues = testValues.apply(changes);

  expect(changedValues.get(Path.parse("c"))).toEqual([{d: 2}]);
});

test("Change", () => {
  const changes = testValues.change(Path.parse("c"), [{d: 2}]);
  const changedValues = testValues.apply(changes);

  expect(changedValues.get(Path.parse("c"))).toEqual([{d: 2}]);
});

test("Instances in an array", () => {
  class Test {
    constructor(public readonly value: string) {
    }
  }

  const value1 = new Test("First");
  const value2 = new Test("Second");
  const value3 = new Test("Third");

  const values = new FormValues([value1, value2, value3]);
  const newValues = new FormValues([value1, value3]);

  const changes = values.compare(newValues);
  const changedValues = values.apply(changes);

  expect(changedValues.get<Test[]>(Path.ROOT).length).toBe(2);
  expect(changedValues.get<Test>(new Path([[PathNodeType.ARRAY_INDEX, 0]]))).toBe(value1);
  expect(changedValues.get<Test>(new Path([[PathNodeType.ARRAY_INDEX, 1]]))).toBe(value3);
});
