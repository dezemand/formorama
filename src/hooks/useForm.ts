import {useCallback, useMemo, useRef, useState} from "react";
import {BLUR_EVENT, CHANGE_EVENT, DO_SUBMIT_EVENT, ERROR_EVENT, FOCUS_EVENT} from "../events";
import {ErrorObject, FormError, FormValue, FormValueType, ValuesMap} from "../types";
import {getRawValue, getRawValues} from "../utils/getRawValues";

export interface UseFormResult<T> {
  listener: EventTarget;
  submitting: boolean;

  internal: {
    getValidationResult(values?: T): Promise<[boolean, ErrorObject<T>]>;
    setSubmitting(submitting: boolean): void;
    name: string | null;
    setSubformValues(name: keyof T, values: ValuesMap<T[keyof T]>): void;
  };

  focus(name: keyof T): void;

  blur(name: keyof T): void;

  getValue<K extends keyof T>(name: K): T[K] | null;

  getError<K extends keyof T>(name: K): FormError | null;

  getValues(): T;

  change<K extends keyof T>(name: K, value: T[K], type?: FormValueType): void;

  submit(): void;
}

export interface UseFormParameters<T> {
  validate?(values: T): ErrorObject<T>;
}

export function useForm<T>({validate}: UseFormParameters<T>): UseFormResult<T> {
  const listener: EventTarget = useMemo(() => new EventTarget(), []);
  const values = useRef<Map<keyof T, FormValue<T[keyof T]>>>(new Map());
  const errors = useRef<Map<keyof T, FormError | null>>(new Map());
  const focusing = useRef<keyof T | null>(null);
  const target = useRef<EventTarget>(listener);
  const [submitting, setSubmitting] = useState(false);

  const change = useCallback<UseFormResult<T>["change"]>((name, value) => {
    values.current.set(name, {value, type: FormValueType.RAW});
    target.current.dispatchEvent(new CustomEvent(CHANGE_EVENT, {detail: {name, value, form: null}}));
  }, []);

  const focus = useCallback<UseFormResult<T>["focus"]>((name) => {
    focusing.current = name;
    target.current.dispatchEvent(new CustomEvent(FOCUS_EVENT, {detail: {name, form: null}}));
  }, []);

  const blur = useCallback<UseFormResult<T>["blur"]>((name) => {
    if (focusing.current === name) focusing.current = null;
    target.current.dispatchEvent(new CustomEvent(BLUR_EVENT, {detail: {name, form: null}}));
  }, []);

  const getValue = useCallback<UseFormResult<T>["getValue"]>((name) => {
    return values.current.has(name) ? getRawValue(values.current.get(name) as FormValue<T[typeof name]>) : null;
  }, []);

  const getError = useCallback<UseFormResult<T>["getError"]>((name) => {
    return errors.current.has(name) ? errors.current.get(name) as FormError : null;
  }, []);

  const getValues = useCallback<UseFormResult<T>["getValues"]>(() => {
    console.log(values.current);
    return getRawValues<T>(values.current);
  }, []);

  const getValidationResult = useCallback<UseFormResult<T>["internal"]["getValidationResult"]>(async (valuesObject) => {
    if (!validate) return [false, []];

    let errored = false;
    const formErrors = await validate(valuesObject || getValues());
    const formErrorsMap = new Map(formErrors);

    for (const field of values.current.keys()) {
      if (formErrorsMap.get(field)) {
        errored = true;
        const error = formErrorsMap.get(field) as FormError;
        formErrorsMap.delete(field);
        errors.current.set(field, error);
        target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: error}}));
      } else {
        errors.current.delete(field);
        target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: null}}));
      }
    }

    for (const [field, error] of formErrorsMap.entries()) {
      errors.current.set(field, error);
      target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: error}}));
    }

    return [errored, formErrors];
  }, [getValues, validate]);

  const submit = useCallback<UseFormResult<T>["submit"]>(() => {
    target.current.dispatchEvent(new CustomEvent(DO_SUBMIT_EVENT));
  }, []);

  const setSubformValues = useCallback<UseFormResult<T>["internal"]["setSubformValues"]>((name, value) => {
    values.current.set(name, {value, type: FormValueType.SUB_FORM});
  }, []);

  return {
    change,
    focus,
    blur,
    listener: target.current,
    getValue,
    getError,
    getValues,
    submitting,
    submit,
    internal: {
      setSubmitting,
      getValidationResult,
      name: null,
      setSubformValues
    }
  };
}
