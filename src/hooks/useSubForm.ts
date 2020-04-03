import {useCallback, useRef} from "react";
import {CHANGE_EVENT, ChangeEventDetail} from "../events";
import {FormError, FormValue, FormValueType, ObjectFormHook, ObjectFormHookInternal, ValuesMap} from "../types";
import {createValuesMap} from "../utils/createValuesMap";
import {getRawValue, getRawValues} from "../utils/getRawValues";

function getInitialValues<T, S>(parentForm: ObjectFormHook<T>, name: string): ValuesMap<S> {
  const values = parentForm.getValue(name as keyof T);
  return values ? createValuesMap<S>(values as unknown as S) : new Map();
}

export function useSubForm<T, S>(parentForm: ObjectFormHook<T>, name: string): ObjectFormHook<S> {
  const values = useRef<ValuesMap<S>>(getInitialValues(parentForm, name));
  const errors = useRef<Map<keyof S, FormError | null>>(new Map());
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}.${name}` : name;

  const pSetSubValues = parentForm.internal.setSubValues;
  const listener = parentForm.listener;

  const updateParent = useCallback(() => pSetSubValues(name as any, {
    type: FormValueType.OBJECT,
    value: values.current as any
  }), [pSetSubValues, name]);

  const change = useCallback<ObjectFormHook<S>["change"]>((fieldName, value) => {
    values.current.set(fieldName, {value, type: FormValueType.RAW});
    updateParent();
    listener.dispatchEvent(new CustomEvent<ChangeEventDetail>(CHANGE_EVENT, {
      detail: {
        name: fieldName as string,
        value,
        form: fullName
      }
    }));
  }, [updateParent, listener, fullName]);

  const getValue = useCallback<ObjectFormHook<S>["getValue"]>((name) => {
    if (!values.current.has(name)) return null;
    return getRawValue(values.current.get(name) as FormValue<S[typeof name]>);
  }, []);

  const getError = useCallback<ObjectFormHook<S>["getError"]>((name) => {
    return errors.current.has(name) ? errors.current.get(name) as FormError : null;
  }, []);

  const focus = useCallback<ObjectFormHook<S>["focus"]>((name) => {
    parentForm.focus(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const blur = useCallback<ObjectFormHook<S>["blur"]>((name) => {
    parentForm.blur(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const getValues = useCallback<ObjectFormHook<S>["getValues"]>(() => {
    return getRawValues(values.current);
  }, []);

  const setSubformValues = useCallback<ObjectFormHookInternal<S>["setSubValues"]>((formName, formValue) => {
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
      setSubValues: setSubformValues
    }
  };
}
