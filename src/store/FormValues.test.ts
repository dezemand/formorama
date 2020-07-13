import {FormValues} from "./FormValues";

interface TestValues {
  a: string;
  b: string;
  c: { d: number }[];
  e: { f: string };
}

const testValues: TestValues = {
  a: "value 1",
  b: "value 2",
  c: [{d: 1}, {d: 2}],
  e: {
    f: "value 3"
  }
};

test("Constructor works", () => {
  const tree = new FormValues(testValues);

  expect(tree.values.raw).toEqual(testValues);
});
