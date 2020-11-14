import {BLUR_EVENT, CHANGE_EVENT, DO_SUBMIT_EVENT, ERROR_EVENT, FOCUS_EVENT, SUBMITTING_EVENT} from "../events";
import {Change} from "./Change";
import {FormController} from "./FormController";
import {Path} from "./Path";

interface TestValues {
  a: string;
  b?: string;
  c: { d: number }[];
  e: { f: string };
}

let testValues: TestValues;

beforeEach(() => {
  testValues = {
    a: "value 1",
    b: "value 2",
    c: [{d: 1}, {d: 2}],
    e: {
      f: "value 3"
    }
  };
});

test("Constructor works", () => {
  const controller = new FormController();

  expect(controller.submitting).toBe(false);
  expect(controller.getValue(Path.ROOT)).toEqual({});
});

test("Changing a value works", () => {
  const changeListener = jest.fn();
  const controller = new FormController();
  const path = Path.parse("a");

  controller.on(CHANGE_EVENT, changeListener);

  controller.change(path, "new value");

  controller.removeListener(CHANGE_EVENT, changeListener);

  expect(changeListener).toBeCalledTimes(1);
  expect(changeListener.mock.calls[0][0]).toEqual([
    new Change(path, "new value")
  ]);
  expect(controller.getValue(path)).toBe("new value");
  expect(controller.getValue(Path.ROOT)).toEqual({a: "new value"});
});

test("Focusing a field works", () => {
  const focusListener = jest.fn();
  const controller = new FormController();
  const path = Path.parse("a");

  controller.on(FOCUS_EVENT, focusListener);

  controller.focus(path);

  controller.removeListener(FOCUS_EVENT, focusListener);

  expect(focusListener).toBeCalledTimes(1);
  expect(focusListener.mock.calls[0][0]).toEqual(path);
  expect(controller.isFocusing(path)).toBe(true);
  expect(controller.hasTouched(path)).toBe(true);
});

test("Blurring works after focusing", () => {
  const focusListener = jest.fn();
  const blurListener = jest.fn();
  const controller = new FormController();
  const path = Path.parse("a");

  controller.on(FOCUS_EVENT, focusListener);
  controller.on(BLUR_EVENT, blurListener);

  controller.focus(path);
  controller.blur(path);

  controller.removeListener(FOCUS_EVENT, focusListener);
  controller.removeListener(BLUR_EVENT, blurListener);

  expect(focusListener).toBeCalledTimes(2);
  expect(focusListener.mock.calls[0][0]).toEqual(path);
  expect(focusListener.mock.calls[1][0]).toEqual(null);
  expect(blurListener).toBeCalledTimes(1);
  expect(blurListener.mock.calls[0][0]).toEqual(path);
  expect(controller.isFocusing(path)).toBe(false);
  expect(controller.isFocusing(null)).toBe(true);
  expect(controller.hasTouched(path)).toBe(true);
});

test("Overriding focus works", () => {
  const focusListener = jest.fn();
  const controller = new FormController();
  const path1 = Path.parse("a");
  const path2 = Path.parse("b");

  controller.on(FOCUS_EVENT, focusListener);

  controller.focus(path1);
  controller.focus(path2);

  controller.removeListener(FOCUS_EVENT, focusListener);

  expect(focusListener).toBeCalledTimes(2);
  expect(focusListener.mock.calls[0][0]).toEqual(path1);
  expect(focusListener.mock.calls[1][0]).toEqual(path2);
  expect(controller.isFocusing(path1)).toBe(false);
  expect(controller.isFocusing(path2)).toBe(true);
  expect(controller.hasTouched(path1)).toBe(true);
  expect(controller.hasTouched(path2)).toBe(true);
});

test("Focusing and blurring do not have race conditions", () => {
  const focusListener = jest.fn();
  const blurListener = jest.fn();
  const controller = new FormController();
  const path1 = Path.parse("a");
  const path2 = Path.parse("b");

  controller.on(FOCUS_EVENT, focusListener);
  controller.on(BLUR_EVENT, blurListener);

  controller.focus(path1);
  controller.focus(path2);
  controller.blur(path1);
  controller.blur(path2);

  controller.removeListener(FOCUS_EVENT, focusListener);
  controller.removeListener(BLUR_EVENT, blurListener);

  expect(focusListener).toBeCalledTimes(3);
  expect(focusListener.mock.calls[0][0]).toEqual(path1);
  expect(focusListener.mock.calls[1][0]).toEqual(path2);
  expect(focusListener.mock.calls[2][0]).toEqual(null);
  expect(blurListener).toBeCalledTimes(2);
  expect(focusListener.mock.calls[0][0]).toEqual(path1);
  expect(focusListener.mock.calls[1][0]).toEqual(path2);
  expect(controller.isFocusing(path1)).toBe(false);
  expect(controller.isFocusing(path2)).toBe(false);
  expect(controller.isFocusing(null)).toBe(true);
  expect(controller.hasTouched(path1)).toBe(true);
  expect(controller.hasTouched(path2)).toBe(true);
});

test("Modify works", () => {
  const changeListener = jest.fn();
  const modifier = jest.fn(values => ({...values, b: "new value", c: [...values.c, {d: 3}]}));
  const controller = new FormController<TestValues>();
  controller.change(Path.ROOT, testValues);

  controller.on(CHANGE_EVENT, changeListener);

  controller.modify<TestValues>(modifier);

  controller.removeListener(CHANGE_EVENT, changeListener);

  expect(changeListener).toBeCalledTimes(1);
  expect(changeListener.mock.calls[0][0]).toEqual([
    new Change(Path.parse("b"), "new value"),
    new Change(Path.parse("c[2].d"), 3)
  ]);
  expect(modifier).toBeCalledTimes(1);
  expect(modifier.mock.calls[0][0]).toEqual(testValues);
  expect(modifier.mock.results[0].value).toEqual({
    a: "value 1",
    b: "new value",
    c: [{d: 1}, {d: 2}, {d: 3}],
    e: {
      f: "value 3"
    }
  });
  expect(controller.getValue(Path.parse("a"))).toBe("value 1"); // Unchanged
  expect(controller.getValue(Path.parse("b"))).toBe("new value"); // Updated
  expect(controller.getValue(Path.parse("c"))).toEqual([{d: 1}, {d: 2}, {d: 3}]); // Updated
  expect(controller.getValue(Path.parse("e"))).toEqual({f: "value 3"}); // Unchanged
});

test("Setting submitting works", () => {
  const submittingListener = jest.fn();
  const controller = new FormController();

  controller.on(SUBMITTING_EVENT, submittingListener);

  expect(controller.submitting).toBe(false);

  controller.submitting = true;

  expect(submittingListener).toBeCalledTimes(1);
  expect(submittingListener.mock.calls[0][0]).toBe(true);
  expect(controller.submitting).toBe(true);

  controller.submitting = false;

  expect(submittingListener).toBeCalledTimes(2);
  expect(submittingListener.mock.calls[1][0]).toBe(false);
  expect(controller.submitting).toBe(false);

  controller.removeListener(SUBMITTING_EVENT, submittingListener);
});

test("Validation can succeed", async () => {
  const validate = jest.fn((_) => ({a: null}));
  const errorListener = jest.fn();
  const controller = new FormController({validate});
  await controller.change(Path.ROOT, testValues);

  controller.on(ERROR_EVENT, errorListener);

  const valid = await controller.validateSubmission();

  controller.removeListener(ERROR_EVENT, errorListener);

  expect(valid).toBe(true);
  expect(validate).toBeCalledTimes(1);
  expect(validate.mock.calls[0][0]).toEqual(testValues);
  expect(validate.mock.results[0].value).toEqual({a: null});
  expect(errorListener).toBeCalledTimes(0);
});

test("Validation can fail", async () => {
  const validate = jest.fn((_) => ({
    a: "error 1",
    c: [null, {d: "error 2"}]
  }));
  const errorListener = jest.fn();
  const controller = new FormController({validate});
  await controller.change(Path.ROOT, testValues);

  controller.on(ERROR_EVENT, errorListener);

  const valid = await controller.validateSubmission();

  controller.removeListener(ERROR_EVENT, errorListener);

  expect(valid).toBe(false);
  expect(validate).toBeCalledTimes(1);
  expect(validate.mock.calls[0][0]).toEqual(testValues);
  expect(validate.mock.results[0].value).toEqual({
    a: "error 1",
    c: [null, {d: "error 2"}]
  });
  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([
    [Path.parse("a"), ["error 1"]],
    [Path.parse("c[1].d"), ["error 2"]]
  ]);
  expect(controller.getErrors(Path.parse("a"))).toEqual(["error 1"]);
  expect(controller.getErrors(Path.parse("c[1].d"))).toEqual(["error 2"]);
});

test("Validation function can be updated", async () => {
  const validate1 = jest.fn((_) => ({a: "error 1"}));
  const validate2 = jest.fn((_) => ({a: "error 2"}));
  const errorListener = jest.fn();
  const controller = new FormController({validate: validate1});
  await controller.change(Path.ROOT, testValues);

  controller.on(ERROR_EVENT, errorListener);

  const valid1 = await controller.validateSubmission();

  expect(valid1).toBe(false);
  expect(validate1).toBeCalledTimes(1);
  expect(validate2).toBeCalledTimes(0);
  expect(controller.getErrors(Path.parse("a"))).toEqual(["error 1"]);
  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([[Path.parse("a"), ["error 1"]]]);

  controller.params = {validate: validate2};

  const valid2 = await controller.validateSubmission();

  expect(valid2).toBe(false);
  expect(validate2).toBeCalledTimes(1);
  expect(controller.getErrors(Path.parse("a"))).toEqual(["error 2"]);
  expect(errorListener).toBeCalledTimes(2);
  expect(errorListener.mock.calls[1][0]).toEqual([[Path.parse("a"), ["error 2"]]]);

  controller.removeListener(ERROR_EVENT, errorListener);
});

test("Validate can succeed after failure by changing the validateSubmission function", async () => {
  const validate1 = jest.fn((_) => ({
    a: "error 1",
    c: [null, {d: "error 2"}]
  }));
  const validate2 = jest.fn((_) => ({a: null}));
  const errorListener = jest.fn();
  const controller = new FormController({validate: validate1});
  await controller.change(Path.ROOT, testValues);

  controller.on(ERROR_EVENT, errorListener);

  const valid1 = await controller.validateSubmission();

  expect(valid1).toBe(false);
  expect(validate1).toBeCalledTimes(1);
  expect(validate2).toBeCalledTimes(0);
  expect(controller.getErrors(Path.parse("a"))).toEqual(["error 1"]);
  expect(controller.getErrors(Path.parse("c[1].d"))).toEqual(["error 2"]);
  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([
    [Path.parse("a"), ["error 1"]],
    [Path.parse("c[1].d"), ["error 2"]]
  ]);

  controller.params = {validate: validate2};

  const valid2 = await controller.validateSubmission();

  expect(valid2).toBe(true);
  expect(validate2).toBeCalledTimes(1);
  expect(controller.getErrors(Path.parse("a"))).toEqual([]);
  expect(controller.getErrors(Path.parse("c[1].d"))).toEqual([]);
  expect(errorListener).toBeCalledTimes(2);
  expect(errorListener.mock.calls[1][0]).toEqual([
    [Path.parse("a"), []],
    [Path.parse("c[1].d"), []]
  ]);

  controller.removeListener(ERROR_EVENT, errorListener);
});

test("Validate can succeed after failure by changing the values", async () => {
  const validate = jest.fn((values: TestValues) => {
    const errors: any = {};
    if (values.a === "value 1") {
      errors.a = "invalid value";
    }
    return errors;
  });
  const errorListener = jest.fn();
  const controller = new FormController({validate});
  await controller.change(Path.ROOT, testValues);

  controller.on(ERROR_EVENT, errorListener);

  const valid1 = await controller.validateSubmission();

  expect(valid1).toBe(false);
  expect(validate).toBeCalledTimes(1);
  expect(controller.getErrors(Path.parse("a"))).toEqual(["invalid value"]);
  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([[Path.parse("a"), ["invalid value"]]]);

  await controller.change(Path.parse("a"), "not value 1");

  const valid2 = await controller.validateSubmission();

  expect(valid2).toBe(true);
  expect(validate).toBeCalledTimes(2);
  expect(controller.getErrors(Path.parse("a"))).toEqual([]);
  expect(errorListener).toBeCalledTimes(2);
  expect(errorListener.mock.calls[1][0]).toEqual([[Path.parse("a"), []]]);

  controller.removeListener(ERROR_EVENT, errorListener);
});

test("Can submit", () => {
  const controller = new FormController();
  const submitListener = jest.fn();

  controller.on(DO_SUBMIT_EVENT, submitListener);

  controller.submit();

  controller.removeListener(DO_SUBMIT_EVENT, submitListener);

  expect(submitListener).toBeCalledTimes(1);
});

test("Can change error", () => {
  const controller = new FormController();
  const errorListener = jest.fn();

  controller.on(ERROR_EVENT, errorListener);

  controller.changeErrors(Path.parse("a.b"), ["an error"]);

  controller.removeListener(ERROR_EVENT, errorListener);

  expect(controller.getErrors(Path.parse("a.b"))).toEqual(["an error"]);
  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([[Path.parse("a.b"), ["an error"]]]);
});

test("Submit without validation", async () => {
  const controller = new FormController();
  const errorListener = jest.fn();
  controller.on(ERROR_EVENT, errorListener);

  const result = await controller.validateSubmission();

  controller.removeListener(ERROR_EVENT, errorListener);

  expect(result).toBe(true);
  expect(errorListener).not.toBeCalled();
});

test("Validation on blur resulting in an error", async () => {
  const controller = new FormController<TestValues>({
    validate: ({a}: TestValues) => ({a: a === "bad" ? "error" : undefined})
  });
  const errorListener = jest.fn();
  controller.on(ERROR_EVENT, errorListener);

  controller.focus(Path.parse("a"));
  await controller.change(Path.parse("a"), "bad");

  expect(errorListener).not.toBeCalled();

  controller.blur(Path.parse("a"));

  // Wait 1 tick
  await (new Promise(resolve => setTimeout(resolve)));

  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([
    [Path.parse("a"), ["error"]]
  ]);
});

test("Validation on blur resolving an error", async () => {
  const controller = new FormController<TestValues>({
    validate: ({a}: TestValues) => ({a: a === "bad" ? "error" : undefined})
  });
  const errorListener = jest.fn();

  controller.focus(Path.parse("a"));
  await controller.change(Path.parse("a"), "bad");
  controller.blur(Path.parse("a"));
  await (new Promise(resolve => setTimeout(resolve)));

  controller.on(ERROR_EVENT, errorListener);

  controller.focus(Path.parse("a"));
  await controller.change(Path.parse("a"), "good");
  controller.blur(Path.parse("a"));

  await (new Promise(resolve => setTimeout(resolve)));
  controller.removeListener(ERROR_EVENT, errorListener);

  expect(errorListener).toBeCalledTimes(1);
  expect(errorListener.mock.calls[0][0]).toEqual([[Path.parse("a"), []]]);
});

test("Focusing the same path does nothing", () => {
  const focusListener = jest.fn();
  const blurListener = jest.fn();
  const controller = new FormController();
  const path = Path.parse("a");

  controller.on(FOCUS_EVENT, focusListener);
  controller.on(BLUR_EVENT, blurListener);

  controller.focus(path);
  controller.focus(path);
  controller.blur(path);

  controller.removeListener(FOCUS_EVENT, focusListener);
  controller.removeListener(BLUR_EVENT, blurListener);

  expect(focusListener).toBeCalledTimes(2);
  expect(focusListener.mock.calls[0][0]).toEqual(path);
  expect(focusListener.mock.calls[1][0]).toEqual(null);
  expect(blurListener).toBeCalledTimes(1);
  expect(focusListener.mock.calls[0][0]).toEqual(path);
});
