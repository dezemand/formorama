import {useCallback, useRef, useState} from "react";
import {ArrayFormHook, ArrayFormHookInternal, ArrayValuesMap, FormValue, FormValueType, ObjectFormHook} from "../types";
import {createFormValue, createValueArrayMap} from "../utils/createValuesMap";
import {getRawArrayValues, getRawValue} from "../utils/getRawValues";
import {createChangeEventForArrayItem} from "../utils/createChangeEvent";

const MAX_VERSION = Number.MAX_SAFE_INTEGER;

function getInitialValues<T, S>(parentForm: ObjectFormHook<T>, name: string): ArrayValuesMap<S[], S> {
  const values = parentForm.getValue(name as keyof T);
  return values ? createValueArrayMap(values as any) : new Map();
}

export function useArrayForm<T, S extends S[]>(parentForm: ObjectFormHook<T>, name: string): ArrayFormHook<S> {
  const values = useRef<ArrayValuesMap<S[], S>>(getInitialValues(parentForm, name));
  const lengthRef = useRef<number>(values.current.size);
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}.${name}` : name;
  const [version, setVersion] = useState(0);

  const pSetSubValues = parentForm.internal.setSubValues;
  const listener = parentForm.listener;

  const updateParent = useCallback(() => pSetSubValues(name as any, {
    type: FormValueType.ARRAY,
    value: values.current
  }), [pSetSubValues, name]);

  // const normalize = useCallback(() => {
  //   const entries = [...values.current.entries()]
  //     .sort((a, b) => a[0] - b[0])
  //     .map(([_, values], index) => [index, values]);
  //   values.current = new Map(entries as any);
  //   updateParent();
  // }, [updateParent]);

  const getValue = useCallback<ArrayFormHook<S>["getValue"]>((index) => {
    if (!values.current.has(index)) return null;
    return getRawValue(values.current.get(index) as FormValue<S[0]>);
  }, []);

  const getValues = useCallback<ArrayFormHook<S>["getValues"]>(() => {
    return getRawArrayValues(values.current);
  }, []);

  const change = useCallback<ArrayFormHook<S>["change"]>((index, newValues) => {
    const formValue = createFormValue(newValues) as FormValue<S[0]>;
    if (formValue.type !== FormValueType.OBJECT) throw new Error("Items in an <ArrayForm> must be an object.");
    values.current.set(index, formValue);
    updateParent();
    listener.dispatchEvent(createChangeEventForArrayItem(index, formValue, fullName));
  }, [fullName, listener, updateParent]);

  const modify = useCallback<ArrayFormHook<S>["modify"]>((modifyCallback) => {
    const currentArray = getValues();
    const modifiedArray = modifyCallback(currentArray);
    const formValue = createFormValue(modifiedArray);

    if (formValue.type !== FormValueType.ARRAY) {
      throw new Error("Modified result is not a valid array.");
    }
    if ([...formValue.value.values()].some(value => value.type !== FormValueType.OBJECT)) {
      throw new Error("Modified array can only contain objects.");
    }

    values.current = formValue.value;
    lengthRef.current = modifiedArray.length;
    setVersion((version + 1) % MAX_VERSION);
  }, [getValues, version]);

  const focus = useCallback<ArrayFormHookInternal["focus"]>((name) => {
    parentForm.focus(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const blur = useCallback<ArrayFormHookInternal["blur"]>((name) => {
    parentForm.blur(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const setItemValues = useCallback<ArrayFormHookInternal["setItemValues"]>((formIndex, formValue) => {
    values.current.set(formIndex, formValue);
    updateParent();
  }, [updateParent]);

  return {
    listener,
    length: lengthRef.current,
    version,
    submitting: parentForm.submitting,
    submit: parentForm.submit,
    getValue,
    getValues,
    change,
    modify,
    internal: {
      name: fullName,
      setSubmitting: parentForm.internal.setSubmitting,
      focus,
      blur,
      setItemValues
    }
  };
}
