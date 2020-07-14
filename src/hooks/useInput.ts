import {useContext, useMemo, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {Path, PathNodeType} from "../store/Path";
import {FormCtx} from "./useForm";
import {useSubmitting} from "./useSubmitting";

interface InputHook<ValueType> {
  value: ValueType;
  error: null;
  focusing: boolean;
  touched: boolean;
  submitting: boolean;
}

export function useInput<ValueType>(name: string, defaultValue: ValueType): InputHook<ValueType> {
  const {path: formPath, controller} = useContext<FormCtx>(FormContext);
  const path = useMemo<Path>(() => formPath.add([PathNodeType.OBJECT_KEY, name]), [formPath, name]);

  const [value, setValue] = useState<ValueType>(() => controller.getValue(path));
  const [error, setError] = useState(() => controller.getError(path));
  const [focusing, setFocusing] = useState(() => controller.isFocusing(path));
  const [touched, setTouched] = useState(() => controller.hasTouched(path));
  const submitting = useSubmitting();

  return {
    value: value === null ? defaultValue : value,
    error,
    focusing,
    touched,
    submitting
  };
}
