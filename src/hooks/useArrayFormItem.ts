import {useCallback, useRef} from "react";
import {
  ArrayFormHook,
  FormError,
  FormValue,
  FormValueType,
  ObjectFormHook,
  ObjectFormHookInternal,
  ValuesMap
} from "../types";
import {getRawValue, getRawValues} from "../utils/getRawValues";
import {CHANGE_EVENT} from "../events";

export function useArrayFormItem<T extends T[], S>(parentForm: ArrayFormHook<T>, index: number): ObjectFormHook<S> {
  const values = useRef<ValuesMap<S>>(new Map());
  const errors = useRef<Map<keyof S, FormError | null>>(new Map());
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}[${index}]` : `[${index}]`;

  const updateParent = () => parentForm.internal.setItemValues(index, {
    type: FormValueType.OBJECT,
    value: values.current as any
  });

  const change = useCallback<ObjectFormHook<S>["change"]>((fieldName, value) => {
    values.current.set(fieldName, {value, type: FormValueType.RAW});
    updateParent();
    parentForm.listener.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
      detail: {
        name: fieldName,
        value,
        form: fullName
      }
    }));
  }, [parentForm.internal, parentForm.listener, fullName, index]);

  const getValue = useCallback<ObjectFormHook<S>["getValue"]>((name) => {
    if (!values.current.has(name)) return null;
    return getRawValue(values.current.get(name) as FormValue<S[typeof name]>);
  }, []);

  const getError = useCallback<ObjectFormHook<S>["getError"]>((name) => {
    return errors.current.has(name) ? errors.current.get(name) as FormError : null;
  }, []);

  const focus = useCallback<ObjectFormHook<S>["focus"]>((name) => {
    parentForm.internal.focus(`${fullName}.${name}` as any);
  }, [fullName, parentForm]);

  const blur = useCallback<ObjectFormHook<S>["blur"]>((name) => {
    parentForm.internal.blur(`${fullName}.${name}` as any);
  }, [fullName, parentForm]);

  const getValues = useCallback<ObjectFormHook<S>["getValues"]>(() => {
    return getRawValues(values.current);
  }, []);

  const setSubValues = useCallback<ObjectFormHookInternal<S>["setSubValues"]>((formName, formValue) => {
    values.current.set(formName, formValue);
    updateParent();
  }, [parentForm.internal, index]);

  return {
    listener: parentForm.listener,
    submitting: parentForm.submitting,
    submit: parentForm.submit,
    change,
    focus,
    blur,
    getValue,
    getError,
    getValues,
    internal: {
      name: fullName,
      setSubmitting: parentForm.internal.setSubmitting,
      setSubValues
    }
  };
}
