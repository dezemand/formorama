import {useCallback, useRef} from "react";
import {ArrayFormHook, ArrayFormHookInternal, ArrayValuesMap, FormValue, FormValueType, ObjectFormHook} from "../types";
import {getRawArrayValues, getRawValue} from "../utils/getRawValues";

export function useArrayForm<T, S extends S[]>(parentForm: ObjectFormHook<T>, name: string): ArrayFormHook<S> {
  const values = useRef<ArrayValuesMap<S[], S>>(new Map());
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}.${name}` : name;

  const updateParent = () => parentForm.internal.setSubValues(name as any, {
    type: FormValueType.ARRAY,
    value: values.current
  });

  const getValue = useCallback<ArrayFormHook<S>["getValue"]>((index) => {
    if (values.current.has(index)) return null;
    return getRawValue(values.current.get(index) as FormValue<S[0]>);
  }, []);

  const focus = useCallback<ArrayFormHookInternal<S>["focus"]>((name) => {
    parentForm.focus(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const blur = useCallback<ArrayFormHookInternal<S>["blur"]>((name) => {
    parentForm.blur(`${fullName}.${name}`);
  }, [fullName, parentForm]);

  const getValues = useCallback<ArrayFormHook<S>["getValues"]>(() => {
    return getRawArrayValues(values.current);
  }, []);

  const setItemValues = useCallback<ArrayFormHookInternal<S>["setItemValues"]>((formIndex, formValue) => {
    values.current.set(formIndex, formValue);
    updateParent();
  }, [name, parentForm.internal]);

  return {
    listener: parentForm.listener,
    submitting: parentForm.submitting,
    submit: parentForm.submit,
    getValue,
    getValues,
    internal: {
      name: fullName,
      setSubmitting: parentForm.internal.setSubmitting,
      focus,
      blur,
      setItemValues
    }
  };
}
