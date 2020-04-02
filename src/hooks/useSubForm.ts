import {UseFormResult} from "./useForm";
import {useCallback, useRef} from "react";
import {FormError, FormValue, FormValueType, ValuesMap} from "../types";
import {getRawValue, getRawValues} from "../utils/getRawValues";
import {CHANGE_EVENT} from "../events";

export function useSubForm<T, S>(parentForm: UseFormResult<T>, name: string): UseFormResult<S> {
  const values = useRef<ValuesMap<S>>(new Map());
  const errors = useRef<Map<keyof S, FormError | null>>(new Map());
  const fullName = parentForm.internal.name ? `${parentForm.internal.name}.${name}` : name;

  const change = useCallback<UseFormResult<S>["change"]>((fieldName, value) => {
    values.current.set(fieldName, {value, type: FormValueType.RAW});
    parentForm.internal.setSubformValues(name as any, values.current as any);
    parentForm.listener.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
      detail: {
        name: fieldName,
        value,
        form: fullName
      }
    }));
  }, [parentForm.listener, fullName, name]);

  const getValue = useCallback<UseFormResult<S>["getValue"]>((name) => {
    return values.current.has(name) ? getRawValue(values.current.get(name) as FormValue<S[typeof name]>) : null;
  }, []);

  const getError = useCallback<UseFormResult<S>["getError"]>((name) => {
    return errors.current.has(name) ? errors.current.get(name) as FormError : null;
  }, []);

  const focus = useCallback<UseFormResult<S>["focus"]>((name) => {
    parentForm.focus(`${fullName}.${name}` as keyof T);
  }, [fullName, parentForm]);

  const blur = useCallback<UseFormResult<S>["blur"]>((name) => {
    parentForm.blur(`${fullName}.${name}` as keyof T);
  }, [fullName, parentForm]);

  const getValues = useCallback<UseFormResult<S>["getValues"]>(() => {
    return getRawValues(values.current);
  }, []);

  const setSubformValues = useCallback<UseFormResult<S>["internal"]["setSubformValues"]>((name, value) => {
    values.current.set(name, {value, type: FormValueType.SUB_FORM});
    parentForm.internal.setSubformValues(name as any, values.current as any);
  }, [parentForm.internal]);

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
      getValidationResult: (() => {
      }) as UseFormResult<S>["internal"]["getValidationResult"],
      name: fullName,
      setSubmitting: parentForm.internal.setSubmitting,
      setSubformValues
    }
  };
}
