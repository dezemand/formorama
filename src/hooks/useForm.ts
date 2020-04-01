import {useCallback, useMemo, useRef, useState} from "react";
import {BLUR_EVENT, CHANGE_EVENT, ERROR_EVENT, FOCUS_EVENT} from "../events";

export type FormError = string | Error;
export type ErrorObject<T> = [keyof T, FormError | null][];

export interface UseFormResult<T> {
  listener: EventTarget;
  submitting: boolean;

  change<K extends keyof T>(name: K, value: T[K]): void;

  focus(name: keyof T): void;

  blur(name: keyof T): void;

  getValue<K extends keyof T>(name: K): T[K] | null;

  getError<K extends keyof T>(name: K): FormError | null;

  getValues(): T;

  getValidationResult(values?: T): Promise<[boolean, ErrorObject<T>]>;

  setSubmitting(submitting: boolean): void;
}

export interface UseFormParameters<T> {
  validate(values: T): ErrorObject<T>;
}

function getValueObject<T>(map: Map<keyof T, T[keyof T]>): T {
  const object: T = {} as T;
  for (const [key, value] of map.entries()) object[key] = value as T[typeof key];
  return object;
}

export function useForm<T>({validate}: UseFormParameters<T>): UseFormResult<T> {
  const listener: EventTarget = useMemo(() => new EventTarget(), []);
  const values = useRef<Map<keyof T, T[keyof T]>>(new Map());
  const errors = useRef<Map<keyof T, FormError | null>>(new Map());
  const focusing = useRef<keyof T | null>(null);
  const target = useRef<EventTarget>(listener);
  const [submitting, setSubmitting] = useState(false);

  const change = useCallback<UseFormResult<T>["change"]>((name, value) => {
    values.current.set(name, value);
    target.current.dispatchEvent(new CustomEvent(CHANGE_EVENT, {detail: {name, value}}));
  }, []);

  const focus = useCallback<UseFormResult<T>["focus"]>((name) => {
    focusing.current = name;
    target.current.dispatchEvent(new CustomEvent(FOCUS_EVENT, {detail: {name}}));
  }, []);

  const blur = useCallback<UseFormResult<T>["blur"]>((name) => {
    if (focusing.current === name) focusing.current = null;
    target.current.dispatchEvent(new CustomEvent(BLUR_EVENT, {detail: {name}}));
  }, []);

  const getValue = useCallback<UseFormResult<T>["getValue"]>((name) => {
    return values.current.has(name) ? values.current.get(name) as T[typeof name] : null;
  }, []);

  const getError = useCallback<UseFormResult<T>["getError"]>((name) => {
    return errors.current.has(name) ? errors.current.get(name) as FormError : null;
  }, []);

  const getValues = useCallback<UseFormResult<T>["getValues"]>(() => {
    return getValueObject(values.current);
  }, []);

  const getValidationResult = useCallback<UseFormResult<T>["getValidationResult"]>(async (valuesObject) => {
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
    setSubmitting,
    getValidationResult
  };
}
