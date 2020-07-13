import {BLUR_EVENT, CHANGE_EVENT, FOCUS_EVENT} from "../events";
import {Change} from "./Change";
import {FormController} from "./FormController";
import {Path} from "./Path";

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
