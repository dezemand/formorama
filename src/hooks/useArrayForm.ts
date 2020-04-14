import {useCallback, useRef} from "react";
import {ArrayFormHook, ArrayFormHookInternal, ArrayValuesMap, FormValue, FormValueType, ObjectFormHook} from "../types";
import {createFormValue, createValueArrayMap} from "../utils/createValuesMap";
import {getRawArrayValues, getRawValue} from "../utils/getRawValues";
import {createChangeEventForArray} from "../utils/createChangeEvent";

function getInitialValues<T, S>(parentForm: ObjectFormHook<T>, name: string): ArrayValuesMap<S[], S> {
  const values = parentForm.getValue(name as keyof T);
  return values ? createValueArrayMap(values as any) : new Map();
}

export function useArrayForm<T, S extends S[]>(parentForm: ObjectFormHook<T>, name: string): ArrayFormHook<S> {
  const values = useRef<ArrayValuesMap<S[], S>>(getInitialValues(parentForm, name));
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}.${name}` : name;

  const pSetSubValues = parentForm.internal.setSubValues;
  const listener = parentForm.listener;

  const updateParent = useCallback(() => pSetSubValues(name as any, {
    type: FormValueType.ARRAY,
    value: values.current
  }), [pSetSubValues, name]);

  const getValue = useCallback<ArrayFormHook<S>["getValue"]>((index) => {
    if (!values.current.has(index)) return null;
    return getRawValue(values.current.get(index) as FormValue<S[0]>);
  }, []);

  const change = useCallback<ArrayFormHook<S>["change"]>((index, newValues) => {
    const formValue = createFormValue(newValues) as FormValue<S[0]>;
    if (formValue.type !== FormValueType.OBJECT) throw new Error("Items in an <ArrayForm> must be an object.");
    values.current.set(index, formValue);
    updateParent();
    listener.dispatchEvent(createChangeEventForArray(index, formValue, fullName));
  }, [fullName, listener, updateParent]);

  const push = useCallback((newValues) => {
    const formValue = createFormValue(newValues) as FormValue<S[0]>;
    if (formValue.type !== FormValueType.OBJECT) throw new Error("Items in an <ArrayForm> must be an object.");

  }, []);

  const focus = useCallback<ArrayFormHookInternal["focus"]>((name) => {
    parentForm.focus(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const blur = useCallback<ArrayFormHookInternal["blur"]>((name) => {
    parentForm.blur(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const getValues = useCallback<ArrayFormHook<S>["getValues"]>(() => {
    return getRawArrayValues(values.current);
  }, []);

  const setItemValues = useCallback<ArrayFormHookInternal["setItemValues"]>((formIndex, formValue) => {
    values.current.set(formIndex, formValue);
    updateParent();
  }, [updateParent]);

  return {
    listener,
    submitting: parentForm.submitting,
    submit: parentForm.submit,
    getValue,
    getValues,
    change,
    internal: {
      name: fullName,
      setSubmitting: parentForm.internal.setSubmitting,
      focus,
      blur,
      setItemValues
    }
  };
}
