import {ChangeEvent, useCallback, useContext, useMemo, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT, ERROR_EVENT, FOCUS_EVENT} from "../events";
import {Change} from "../store/Change";
import {ImmutableValuesTree} from "../store/ImmutableValuesTree";
import {Path, PathNodeType} from "../store/Path";
import {useEventEmitter} from "./useEventEmitter";
import {FormCtx} from "./useForm";
import {useSubmitting} from "./useSubmitting";

export function fixValue<ValueType>(obj: ChangeEvent | ValueType): ValueType {
  return obj instanceof Event ? (obj.target as HTMLInputElement).value as any : obj as any;
}

interface InputHook<ValueType> {
  value: ValueType;
  error: null;
  focusing: boolean;
  touched: boolean;
  submitting: boolean;

  handleChange(eventOrValue: ChangeEvent<HTMLElement> | any): void;

  handleFocus(event: FocusEvent): void;

  handleBlur(event: FocusEvent): void;
}

export function useInput<ValueType>(name: string, defaultValue: ValueType): InputHook<ValueType> {
  const {path: formPath, controller} = useContext<FormCtx>(FormContext);
  const path = useMemo<Path>(() => formPath.add([PathNodeType.OBJECT_KEY, name]), [formPath, name]);

  const [value, setValue] = useState<ValueType>(() => controller.getValue(path));
  const [error, setError] = useState(() => controller.getError(path));
  const [focusing, setFocusing] = useState(() => controller.isFocusing(path));
  const [touched, setTouched] = useState(() => controller.hasTouched(path));
  const submitting = useSubmitting();

  // Event handlers for elements
  const handleChange = useCallback<InputHook<ValueType>["handleChange"]>(eventOrValue => {
    controller.change(path, fixValue(eventOrValue));
  }, [controller, path]);

  const handleFocus = useCallback<InputHook<ValueType>["handleFocus"]>(() => {
    controller.focus(path);
  }, [controller, path]);

  const handleBlur = useCallback<InputHook<ValueType>["handleBlur"]>(() => {
    controller.blur(path);
  }, [controller, path]);

  // Event listeners for the controller
  const focusListener = useCallback<(focusedPath: Path) => void>(focusedPath => {
    setFocusing(focusedPath && focusedPath.equals(path));
    setTouched(controller.hasTouched(path));
  }, [controller, path]);

  const changeListener = useCallback<(changes: Change[]) => void>(changes => {
    let updated = false;
    let valueTree = new ImmutableValuesTree(value);

    for (const change of changes) {
      if (path.parentOf(change.path)) {
        updated = true;
        valueTree = valueTree.set(change.path.slice(path.nodes.length), change.value);
      }
    }

    if (updated) {
      setValue(valueTree.raw);
    }
  }, [path, value]);

  const errorListener = useCallback<(errors: [Path, any][]) => void>(errors => {
    let updated = false;
    let errorTree = new ImmutableValuesTree(value);

    for (const [errorPath, error] of errors) {
      if (path.parentOf(errorPath)) {
        updated = true;
        errorTree = errorTree.set(errorPath.slice(path.nodes.length), error);
      }
    }

    if (updated) {
      setError(errorTree.raw);
    }
  }, [path, value]);

  useEventEmitter(controller, FOCUS_EVENT, focusListener);
  useEventEmitter(controller, CHANGE_EVENT, changeListener);
  useEventEmitter(controller, ERROR_EVENT, errorListener);

  return {
    value: value === null ? defaultValue : value,
    error,
    focusing,
    touched,
    submitting,
    handleFocus,
    handleBlur,
    handleChange
  };
}
