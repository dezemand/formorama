import {useCallback, useMemo, useRef, useState} from "react";
import {
  BLUR_EVENT,
  CHANGE_MANY_EVENT,
  ChangeManyEventDetail,
  DO_SUBMIT_EVENT,
  ERROR_EVENT,
  FOCUS_EVENT,
  FocusBlurEventDetail
} from "../events";
import {ErrorObject, FormError, FormValue, RootFormHook, RootFormHookInternal, ValuesMap} from "../types";
import {createUpdateMap} from "../utils/createUpdateMap";
import {createFormValue, createValuesMap} from "../utils/createValuesMap";
import {getRawValue, getRawValues} from "../utils/getRawValues";
import {createChangeEvent} from "../utils/createChangeEvent";

export interface UseFormParameters<T> {
  validate?(values: T): ErrorObject<T>;
}

export function useForm<T>({validate}: UseFormParameters<T>): RootFormHook<T> {
  const listener: EventTarget = useMemo(() => new EventTarget(), []);
  const values = useRef<ValuesMap<T>>(new Map());
  const errors = useRef<Map<keyof T, FormError | null>>(new Map());
  const focusing = useRef<string | null>(null);
  const target = useRef<EventTarget>(listener);
  const [submitting, setSubmitting] = useState(false);

  const change = useCallback<RootFormHook<T>["change"]>((name, value) => {
    const formValue = createFormValue(value) as FormValue<T[keyof T]>;
    values.current.set(name, formValue);
    target.current.dispatchEvent(createChangeEvent(name as string, formValue, null));
  }, []);

  const focus = useCallback<RootFormHook<T>["focus"]>((name) => {
    focusing.current = name;
    target.current.dispatchEvent(new CustomEvent<FocusBlurEventDetail>(FOCUS_EVENT, {detail: {name, form: null}}));
  }, []);

  const blur = useCallback<RootFormHook<T>["blur"]>((name) => {
    if (focusing.current === name) focusing.current = null;
    target.current.dispatchEvent(new CustomEvent<FocusBlurEventDetail>(BLUR_EVENT, {detail: {name, form: null}}));
  }, []);

  const getValue = useCallback<RootFormHook<T>["getValue"]>((name) => {
    return values.current.has(name) ? getRawValue(values.current.get(name) as FormValue<T[typeof name]>) : null;
  }, []);

  const getError = useCallback<RootFormHook<T>["getError"]>((name) => {
    return errors.current.has(name) ? errors.current.get(name) as FormError : null;
  }, []);

  const getValues = useCallback<RootFormHook<T>["getValues"]>(() => {
    return getRawValues<T>(values.current);
  }, []);

  const getValidationResult = useCallback<RootFormHookInternal<T>["getValidationResult"]>(async (valuesObject) => {
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

  const setValues = useCallback<RootFormHook<T>["setValues"]>((newValues) => {
    values.current = createValuesMap(newValues);
    target.current.dispatchEvent(new CustomEvent<ChangeManyEventDetail>(CHANGE_MANY_EVENT, {detail: {updates: createUpdateMap(values.current)}}));
  }, []);

  const submit = useCallback<RootFormHook<T>["submit"]>(() => {
    target.current.dispatchEvent(new CustomEvent(DO_SUBMIT_EVENT));
  }, []);

  const setSubValues = useCallback<RootFormHookInternal<T>["setSubValues"]>((name, value) => {
    values.current.set(name, value);
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
    setValues,
    internal: {
      setSubmitting,
      getValidationResult,
      name: null,
      setSubValues
    }
  };
}
