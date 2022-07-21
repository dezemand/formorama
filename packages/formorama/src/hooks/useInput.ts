import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FormContext, FormContextValue } from "../contexts/FormContext";
import { CHANGE_EVENT, ERROR_EVENT, FormEventListener, FOCUS_EVENT } from "../events";
import { Change } from "../store/Change";
import { FormValues } from "../store/FormValues";
import { Path, PathNodeType } from "../store/Path";
import { ValidationError } from "../validation/Validator";
import { useEventEmitter } from "./useEventEmitter";
import { useSubmitting } from "./useSubmitting";

export function fixValue<ValueType>(eventOrValue: any): ValueType {
  return eventOrValue?.target?.value ?? eventOrValue;
}

interface ChangeListeners {
  onChange(eventOrValue: any): void;
}

interface FocusListeners {
  onFocus(event: any): void;
  onBlur(event: any): void;
}

export interface UseInput<ValueType> {
  value: ValueType;
  error: ValidationError | null;
  errors: ValidationError[];
  focused: boolean;
  touched: boolean;
  submitting: boolean;
  listeners: ChangeListeners & FocusListeners;
  changeListeners: ChangeListeners;
  focusListeners: FocusListeners;

  handleChange(eventOrValue: any): void;

  handleError(error: any): void;

  handleFocus(): void;

  handleBlur(): void;
}

export function useInput<ValueType>(name: string, defaultValue: ValueType): UseInput<ValueType> {
  const { path: formPath, controller } = useContext<FormContextValue>(FormContext);
  const path = useMemo<Path>(() => formPath.add([PathNodeType.OBJECT_KEY, name]), [formPath, name]);

  const init = useRef(true);
  const [value, setValue] = useState<FormValues<ValueType>>(() => new FormValues(controller.getValue(path)));
  const [errors, setErrors] = useState(() => controller.getErrors(path));
  const [focused, setFocused] = useState(() => controller.isFocusing(path));
  const [touched, setTouched] = useState(() => controller.hasTouched(path));
  const submitting = useSubmitting();

  // Event handlers for elements
  const handleChange = useCallback<UseInput<ValueType>["handleChange"]>(
    (eventOrValue) => {
      controller.change(path, fixValue(eventOrValue));
    },
    [controller, path]
  );

  const handleError = useCallback<UseInput<ValueType>["handleError"]>(
    (error) => {
      controller.changeErrors(path, error);
    },
    [controller, path]
  );

  const handleFocus = useCallback<UseInput<ValueType>["handleFocus"]>(() => {
    controller.focus(path);
  }, [controller, path]);

  const handleBlur = useCallback<UseInput<ValueType>["handleBlur"]>(() => {
    controller.blur(path);
  }, [controller, path]);

  // Event listeners for the controller
  const focusListener = useCallback<FormEventListener<typeof FOCUS_EVENT>>(
    (focusedPath) => {
      const nextFocused = Boolean(focusedPath && focusedPath.equals(path));
      const nextTouched = controller.hasTouched(path);

      if (touched !== nextTouched) {
        setTouched(nextTouched);
      }
      if (focused !== nextFocused) {
        setFocused(nextFocused);
      }
    },
    [controller, path, touched, focused]
  );

  const changeListener = useCallback<FormEventListener<typeof CHANGE_EVENT>>(
    (changes) => {
      const subChanges = Change.subChanges(changes, path);
      if (subChanges.length > 0) {
        setValue(value.apply(subChanges));
      }
    },
    [path, value]
  );

  const errorListener = useCallback<FormEventListener<typeof ERROR_EVENT>>(
    (errors) => {
      const error = errors.find(([errorPath]) => errorPath.equals(path));
      if (error) {
        setErrors(error[1]);
      }
    },
    [path]
  );

  useEffect(() => {
    if (!init.current) {
      setValue(new FormValues(controller.getValue(path)));
      setErrors(controller.getErrors(path));
      setFocused(controller.isFocusing(path));
      setTouched(controller.hasTouched(path));
    } else {
      init.current = false;
    }
  }, [controller, path]);

  useEventEmitter(controller, FOCUS_EVENT, focusListener);
  useEventEmitter(controller, CHANGE_EVENT, changeListener);
  useEventEmitter(controller, ERROR_EVENT, errorListener);

  return {
    value: value.get(Path.ROOT) === null ? defaultValue : value.get(Path.ROOT),
    error: errors.length > 0 ? errors[0] : null,
    errors,
    focused,
    touched,
    submitting,
    handleFocus,
    handleBlur,
    handleChange,
    handleError,
    listeners: { onChange: handleChange, onFocus: handleFocus, onBlur: handleBlur },
    changeListeners: { onChange: handleChange },
    focusListeners: { onFocus: handleFocus, onBlur: handleBlur }
  };
}
