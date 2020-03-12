import React, {FC, MutableRefObject, useCallback, useMemo, useRef, useState} from "react";
import {FormContext, FormContextValue} from "../contexts/FormContext";
import {BLUR_EVENT, CHANGE_EVENT, ERROR_EVENT, FOCUS_EVENT} from "../events";

type ValuesObject = { [key: string]: any };

const getValuesObject = (values: Map<string, any>): ValuesObject => {
  const obj: ValuesObject = {};
  for (const [key, value] of values.entries()) {
    obj[key] = value;
  }
  return obj;
};

export interface FormProps {
  onSubmit?: (values: ValuesObject) => Promise<void>;
  onError: (errors: ValuesObject, values: ValuesObject) => Promise<void>;
  validate: (values: ValuesObject, fields: string[] | null) => Promise<ValuesObject>;
}

export const Form: FC<FormProps> = ({children, onSubmit, onError, validate}) => {
  const listener: EventTarget = useMemo(() => new EventTarget(), []);
  const values: MutableRefObject<Map<string, any>> = useRef(new Map());
  const errors: MutableRefObject<Map<string, any>> = useRef(new Map());
  const focusing: MutableRefObject<string | null> = useRef(null);
  const target: MutableRefObject<EventTarget> = useRef(listener);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleValidate = useCallback(async (valuesObject, fields) => {
    const validateResult = validate ? await validate(valuesObject, fields) : {};
    const validateMap = new Map(Object.entries(validateResult)) as Map<string, any>;
    let errored = false;

    for (const field of values.current.keys()) {
      if (validateMap.has(field)) {
        errored = true;
        const error = validateMap.get(field);
        validateMap.delete(field);
        errors.current.set(field, error);
        target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: error}}));
      } else {
        errors.current.delete(field);
        target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: null}}));
      }
    }

    for (const [field, error] of validateMap.entries()) {
      errors.current.set(field, error);
      target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: error}}));
    }

    return {errored, validateResult};
  }, [validate]);

  const handleSubmit = useCallback(async event => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const valuesObject = getValuesObject(values.current);
    const {errored, validateResult} = await handleValidate(valuesObject, null);

    if (errored && onError) await onError(validateResult, valuesObject);
    if (!errored && onSubmit) await onSubmit(valuesObject);

    setSubmitting(false);
  }, [onSubmit, onError, submitting, handleValidate]);

  const revalidate = useCallback(async fields => {
    const valuesObject = getValuesObject(values.current);
    await handleValidate(valuesObject, new Set(fields));
  }, [handleValidate]);

  const change = useCallback((name, value) => {
    values.current.set(name, value);
    target.current.dispatchEvent(new CustomEvent(CHANGE_EVENT, {detail: {name, value}}));
  }, []);

  const focus = useCallback(name => {
    focusing.current = name;
    target.current.dispatchEvent(new CustomEvent(FOCUS_EVENT, {detail: {name}}));
  }, []);

  const blur = useCallback(name => {
    if (focusing.current === name) {
      focusing.current = null;
    }
    target.current.dispatchEvent(new CustomEvent(BLUR_EVENT, {detail: {name}}));
  }, []);

  const getValue = useCallback(name => {
    return values.current.has(name) ? values.current.get(name) : null;
  }, []);

  const getError = useCallback(name => {
    return errors.current.has(name) ? errors.current.get(name) : null;
  }, []);

  const contextValue: FormContextValue = {
    change,
    focus,
    blur,
    listener: target.current,
    getValue,
    getError,
    submitting,
    revalidate
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};
