import { ValidationResult } from "../validation/Validator";
import { FormErrors } from "./FormErrors";
import { Path } from "./Path";

// .map(([path, errors]) => [path.pathString, errors])

test("Constructor works", () => {
  const errors = new FormErrors([
    [Path.parse("a"), ["error 1", "error 2"]],
    [Path.parse("b.c"), ["error 3"]],
    [Path.parse("d[1].e"), ["error 4"]]
  ]);

  expect(errors.get(Path.parse("a"))).toEqual(["error 1", "error 2"]);
  expect(errors.get(Path.parse("b.c"))).toEqual(["error 3"]);
  expect(errors.get(Path.parse("d[1].e"))).toEqual(["error 4"]);
});

test("Sub errors", () => {
  const errors = new FormErrors([
    [Path.parse("a"), ["root error"]],
    [Path.parse("a.b"), ["error 1"]],
    [Path.parse("a.c"), ["error 2"]],
    [Path.parse("a.d"), ["error 3"]]
  ]);

  const subErrors = errors.subErrors(Path.parse("a"));

  expect(subErrors.get(Path.ROOT)).toEqual(["root error"]);
  expect(subErrors.get(Path.parse("b"))).toEqual(["error 1"]);
  expect(subErrors.get(Path.parse("c"))).toEqual(["error 2"]);
  expect(subErrors.get(Path.parse("d"))).toEqual(["error 3"]);
});

describe("Comparing", () => {
  let emptyErrors: FormErrors;
  let errors1: FormErrors;

  beforeEach(() => {
    emptyErrors = FormErrors.EMPTY;
    errors1 = new FormErrors([
      [Path.parse("a"), ["error 1", "error 2"]],
      [Path.parse("b"), ["error 3"]],
      [Path.parse("c.d"), ["error 4"]],
      [Path.parse("e[1].f"), ["error 5"]]
    ]);
  });

  test("Comparing to empty errors list", () => {
    expect(errors1.compare(emptyErrors)).toEqual([
      [Path.parse("a"), []],
      [Path.parse("b"), []],
      [Path.parse("c.d"), []],
      [Path.parse("e[1].f"), []]
    ]);
  });

  test("Removing some errors", () => {
    const errors2 = new FormErrors([
      [Path.parse("b"), ["error 3"]],
      [Path.parse("c.d"), ["error 4"]]
    ]);

    expect(errors1.compare(errors2)).toEqual([
      [Path.parse("a"), []],
      [Path.parse("e[1].f"), []]
    ]);
  });

  test("Comparing empty list to new errors", () => {
    expect(emptyErrors.compare(errors1)).toEqual([
      [Path.parse("a"), ["error 1", "error 2"]],
      [Path.parse("b"), ["error 3"]],
      [Path.parse("c.d"), ["error 4"]],
      [Path.parse("e[1].f"), ["error 5"]]
    ]);
  });

  test("Adding new errors", () => {
    const errors2 = new FormErrors([
      [Path.parse("a"), ["error 1", "error 2"]],
      [Path.parse("b"), ["error 3"]],
      [Path.parse("c.d"), ["error 4"]],
      [Path.parse("e[1].f"), ["error 5"]],
      [Path.parse("e[2].f"), ["error 6"]]
    ]);

    expect(errors1.compare(errors2)).toEqual([[Path.parse("e[2].f"), ["error 6"]]]);
  });

  test("Modifying errors", () => {
    const errors2 = new FormErrors([
      [Path.parse("a"), ["error 1", "error 2"]],
      [Path.parse("b"), ["error 3"]],
      [Path.parse("c.d"), ["error 4"]],
      [Path.parse("e[1].f"), ["changed error"]]
    ]);

    expect(errors1.compare(errors2)).toEqual([[Path.parse("e[1].f"), ["changed error"]]]);
  });

  test("Removing a single error", () => {
    const errors2 = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("b"), ["error 3"]],
      [Path.parse("c.d"), ["error 4"]],
      [Path.parse("e[1].f"), ["error 5"]]
    ]);

    expect(errors1.compare(errors2)).toEqual([[Path.parse("a"), ["error 1"]]]);
  });
});

describe("Applying validation results", () => {
  interface TestValues {
    a: string;
    b?: string;
    c: { d: number }[];
    e: { f: string };
  }

  let values: TestValues;
  let fullValidationValid: ValidationResult<any>;
  let fullValidationInvalid: ValidationResult<any>;
  let fieldValidationValid: ValidationResult<any>;
  let fieldValidationInvalid: ValidationResult<any>;
  let emptyErrors: FormErrors;

  beforeEach(() => {
    values = {
      a: "value 1",
      b: "value 2",
      c: [{ d: 1 }, { d: 2 }],
      e: { f: "value 3" }
    };

    fullValidationValid = {
      valid: true,
      path: Path.ROOT,
      value: values,
      errors: []
    };

    fullValidationInvalid = {
      valid: false,
      path: Path.ROOT,
      value: values,
      errors: [
        [Path.parse("a"), ["error 1"]],
        [Path.parse("c[1].d"), ["error 2"]],
        [Path.parse("e"), ["error 3"]]
      ]
    };

    fieldValidationValid = {
      valid: true,
      path: Path.parse("c[1].d"),
      value: values.c[1].d,
      errors: []
    };

    fieldValidationInvalid = {
      valid: false,
      path: Path.parse("c[1].d"),
      value: values.c[1].d,
      errors: [[Path.ROOT, ["error"]]]
    };

    emptyErrors = FormErrors.EMPTY;
  });

  test("Applying full valid errors to empty errors", () => {
    const newErrors = emptyErrors.applyValidationResults([fullValidationValid]);
    expect(emptyErrors.compare(newErrors)).toEqual([]);
  });

  test("Applying full valid errors to existing errors", () => {
    const errors = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[1].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);

    const newErrors = errors.applyValidationResults([fullValidationValid]);

    expect(errors.compare(newErrors)).toEqual([
      [Path.parse("a"), []],
      [Path.parse("c[1].d"), []],
      [Path.parse("e"), []]
    ]);
    expect(newErrors.get(Path.parse("a"))).toEqual([]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual([]);
    expect(newErrors.get(Path.parse("e"))).toEqual([]);
  });

  test("Applying full invalid errors to empty errors", () => {
    const newErrors = emptyErrors.applyValidationResults([fullValidationInvalid]);

    expect(emptyErrors.compare(newErrors)).toEqual([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[1].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
    expect(newErrors.get(Path.parse("a"))).toEqual(["error 1"]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual(["error 2"]);
    expect(newErrors.get(Path.parse("e"))).toEqual(["error 3"]);
  });

  test("Applying full invalid errors to same errors", () => {
    const errors = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[1].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
    const newErrors = errors.applyValidationResults([fullValidationInvalid]);

    expect(errors.compare(newErrors)).toEqual([]);
    expect(newErrors.get(Path.parse("a"))).toEqual(["error 1"]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual(["error 2"]);
    expect(newErrors.get(Path.parse("e"))).toEqual(["error 3"]);
  });

  test("Applying full invalid errors to different errors", () => {
    const errors = new FormErrors([
      [Path.parse("b"), ["different error 1"]],
      [Path.parse("c[0].d"), ["different error 2"]],
      [Path.parse("e.f"), ["different error 3"]]
    ]);
    const newErrors = errors.applyValidationResults([fullValidationInvalid]);

    expect(errors.compare(newErrors)).toEqual([
      [Path.parse("b"), []],
      [Path.parse("c[0].d"), []],
      [Path.parse("e.f"), []],
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[1].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
  });

  test("Applying valid field errors to empty errors", () => {
    const newErrors = emptyErrors.applyValidationResults([fieldValidationValid]);
    expect(emptyErrors.compare(newErrors)).toEqual([]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual([]);
  });

  test("Applying valid field errors to errors containing the field", () => {
    const errors = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[1].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
    const newErrors = errors.applyValidationResults([fieldValidationValid]);

    expect(errors.compare(newErrors)).toEqual([[Path.parse("c[1].d"), []]]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual([]);
  });

  test("Applying valid field errors to errors not containing the field", () => {
    const errors = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[0].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
    const newErrors = errors.applyValidationResults([fieldValidationValid]);

    expect(errors.compare(newErrors)).toEqual([]);
    expect(newErrors.get(Path.parse("c[0].d"))).toEqual(["error 2"]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual([]);
  });

  test("Applying invalid field errors to empty errors", () => {
    const newErrors = emptyErrors.applyValidationResults([fieldValidationInvalid]);

    expect(emptyErrors.compare(newErrors)).toEqual([[Path.parse("c[1].d"), ["error"]]]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual(["error"]);
  });

  test("Applying invalid field errors to errors containing the field", () => {
    const errors = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[1].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
    const newErrors = errors.applyValidationResults([fieldValidationInvalid]);

    expect(errors.compare(newErrors)).toEqual([[Path.parse("c[1].d"), ["error"]]]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual(["error"]);
  });

  test("Applying invalid field errors to errors not containing the field", () => {
    const errors = new FormErrors([
      [Path.parse("a"), ["error 1"]],
      [Path.parse("c[0].d"), ["error 2"]],
      [Path.parse("e"), ["error 3"]]
    ]);
    const newErrors = errors.applyValidationResults([fieldValidationInvalid]);

    expect(errors.compare(newErrors)).toEqual([[Path.parse("c[1].d"), ["error"]]]);
    expect(newErrors.get(Path.parse("c[1].d"))).toEqual(["error"]);
  });
});
