import {useCallback, useContext, useMemo, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {BLUR_EVENT, CHANGE_EVENT, CustomChangeEvent, CustomFocusBlurEvent, FOCUS_EVENT} from "../events";
import {FormError, InputHook, Path, PathNodeType} from "../types";
import {pathEquals, pathParentOf, setTreeValue} from "../utils/path";
import {useEventListener} from "./useEventListener";

export function useInput(name: string, defaultValue: any): InputHook {
  const form = useContext(FormContext);
  const path = useMemo<Path>(() => [...form.path, [PathNodeType.OBJECT_KEY, name]], [form.path, name]);

  const {root: {change, focus, blur, submitting, getValue, target, getError, isFocused}} = form;

  const [value, setValue] = useState(() => {
    let value = getValue(path);
    if (value === null) {
      value = defaultValue;
      change(path, defaultValue);
    }
    return value;
  });
  const [error, setError] = useState<FormError | null>(() => getError(path));
  const [focused, setFocused] = useState<boolean>(() => isFocused(path));

  const changeEventHandler = useCallback((event: CustomChangeEvent) => {
    let newValue = value;
    let changedValue = false;

    for (const {path: valuePath, value} of event.detail.values) {
      if (pathEquals(valuePath, path)) {
        newValue = value;
        changedValue = true;
      } else if (pathParentOf(path, valuePath)) {
        const subPath = valuePath.slice(path.length);
        const tree = newValue || (subPath[0][0] === PathNodeType.ARRAY_INDEX ? [] : {});
        setTreeValue(tree, subPath, value);
        newValue = tree;
        changedValue = true;
      }
    }

    for (const {path: errorPath, error} of event.detail.errors) {
      if (pathEquals(errorPath, path)) {
        setError(error);
      }
    }

    if (changedValue) {
      setValue(newValue);
    }
  }, [path]);

  const focusEventHandler = useCallback((event: CustomFocusBlurEvent) => {
    if (pathEquals(event.detail.path, path)) {
      setFocused(true);
    }
  }, [path]);

  const blurEventHandler = useCallback((event: CustomFocusBlurEvent) => {
    if (pathEquals(event.detail.path, path)) {
      setFocused(false);
    }
  }, [path]);

  useEventListener(target, CHANGE_EVENT, changeEventHandler as EventListener);
  useEventListener(target, FOCUS_EVENT, focusEventHandler as EventListener);
  useEventListener(target, BLUR_EVENT, blurEventHandler as EventListener);

  const handleChange = useCallback<InputHook["handleChange"]>(event => {
    if (event && event.target) {
      change(path, event.target.value);
    } else {
      change(path, event);
    }
  }, [change, path]);

  const handleFocus = useCallback<InputHook["handleFocus"]>(() => {
    focus(path);
  }, [focus, path]);

  const handleBlur = useCallback<InputHook["handleBlur"]>(() => {
    blur(path);
  }, [blur, path]);

  return {
    value,
    error,
    handleChange,
    handleFocus,
    handleBlur,
    submitting,
    focused
  };
}
