import { useCallback, useContext, useMemo, useState } from "react";
import { FormContext } from "../contexts/FormContext";
import { CHANGE_EVENT, ERROR_EVENT, FOCUS_EVENT } from "../events";
import { Change } from "../store/Change";
import { FormValues } from "../store/FormValues";
import { Path, PathNodeType } from "../store/Path";
import { FieldError, ValidationError } from "../validation/Validator";
import { useEventEmitter } from "./useEventEmitter";
import { FormCtx } from "./useForm";
import { useSubmitting } from "./useSubmitting";

export function fixValue<ValueType>(obj: any): ValueType {
  return obj && obj.target ? obj.target.value : obj;
}

interface InputHook<ValueType> {
  value: ValueType;
  error: ValidationError | null;
  errors: ValidationError[];
  focused: boolean;
  touched: boolean;
  submitting: boolean;

  handleChange(eventOrValue: any): void;

  handleError(error: any): void;

  handleFocus(): void;

  handleBlur(): void;
}

export function useInput<ValueType>(name: string, defaultValue: ValueType): InputHook<ValueType> {
  const { path: formPath, controller } = useContext<FormCtx>(FormContext);
  const path = useMemo<Path>(() => formPath.add([PathNodeType.OBJECT_KEY, name]), [formPath, name]);

  const [value, setValue] = useState<FormValues<ValueType>>(() => new FormValues(controller.getValue(path)));
  const [errors, setErrors] = useState(() => controller.getErrors(path));
  const [focused, setFocused] = useState(() => controller.isFocusing(path));
  const [touched, setTouched] = useState(() => controller.hasTouched(path));
  const submitting = useSubmitting();

  // Event handlers for elements
  const handleChange = useCallback<InputHook<ValueType>["handleChange"]>(
    (eventOrValue) => {
      controller.change(path, fixValue(eventOrValue));
    },
    [controller, path]
  );

  const handleError = useCallback<InputHook<ValueType>["handleError"]>(
    (error) => {
      controller.changeErrors(path, error);
    },
    [controller, path]
  );

  const handleFocus = useCallback<InputHook<ValueType>["handleFocus"]>(() => {
    controller.focus(path);
  }, [controller, path]);

  const handleBlur = useCallback<InputHook<ValueType>["handleBlur"]>(() => {
    controller.blur(path);
  }, [controller, path]);

  // Event listeners for the controller
  const focusListener = useCallback<(focusedPath: Path) => void>(
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

  const changeListener = useCallback<(changes: Change[]) => void>(
    (changes) => {
      const subChanges = Change.subChanges(changes, path);
      if (subChanges.length > 0) {
        setValue(value.apply(subChanges));
      }
    },
    [path, value]
  );

  const errorListener = useCallback<(errors: FieldError[]) => void>(
    (errors) => {
      const error = errors.find(([errorPath]) => errorPath.equals(path));
      if (error) {
        setErrors(error[1]);
      }
    },
    [path]
  );

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
    handleError
  };
}
