import {Change} from "./Change";
import {FormValues} from "./FormValues";
import {Path} from "./Path";

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

test("Applying a change works", () => {
  const changes = [new Change(Path.parse("a"), "new value")];

  const newValues = testValues.apply(changes);

  expect(newValues.values.get(Path.parse("a"))).toBe("new value");
});

test("Applying a deep change works", () => {
  const changes = [new Change(Path.parse("c[1].d"), 42)];

  const newValues = testValues.apply(changes);

  expect(newValues.values.get(Path.parse("c[1].d"))).toBe(42);
});

test("Applying multiple changes", () => {
  const changes = [
    new Change(Path.parse("c[0].d"), 42),
    new Change(Path.parse("c[1].d"), 43),
    new Change(Path.parse("b"), "new value")
  ];

  const newValues = testValues.apply(changes);

  expect(newValues.values.raw).toEqual({
    a: "value 1",
    b: "new value",
    c: [{d: 42}, {d: 43}],
    e: {
      f: "value 3"
    }
  });
});
