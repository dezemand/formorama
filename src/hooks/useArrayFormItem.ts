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
import {createFormValue, createValuesMap} from "../utils/createValuesMap";
import {getRawValue, getRawValues} from "../utils/getRawValues";
import {createChangeEvent} from "../utils/createChangeEvent";

function getInitialValues<T extends T[], S>(parentForm: ArrayFormHook<T>, index: number): ValuesMap<S> {
  const values = parentForm.getValue(index);
  return values ? createValuesMap(values) : new Map();
}

export function useArrayFormItem<T extends T[], S>(parentForm: ArrayFormHook<T>, index: number): ObjectFormHook<S> {
  const values = useRef<ValuesMap<S>>(getInitialValues(parentForm, index));
  const errors = useRef<Map<keyof S, FormError | null>>(new Map());
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}[${index}]` : `[${index}]`;

  const pSetItemValues = parentForm.internal.setItemValues;
  const listener = parentForm.listener;

  const updateParent = useCallback(() => pSetItemValues(index, {
    type: FormValueType.OBJECT,
    value: values.current as any
  }), [pSetItemValues, index]);

  const change = useCallback<ObjectFormHook<S>["change"]>((fieldName, value) => {
    const formValue = createFormValue(value) as FormValue<S[keyof S]>;
    values.current.set(fieldName, formValue);
    updateParent();
    listener.dispatchEvent(createChangeEvent(fieldName as string, formValue, fullName));
  }, [updateParent, listener, fullName]);

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
  }, [updateParent]);

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
