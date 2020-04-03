import {ChangeEvent, FocusEvent, useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT, ERROR_EVENT} from "../events";
import {useEventListener} from "./useEventListener";
import {FormType} from "../types";

export interface UseInputResult {
  value: any;
  error: any;
  submitting: boolean;

  handleChange(event: ChangeEvent<HTMLElement> | any): void;

  handleFocus(event: FocusEvent): void;

  handleBlur(event: FocusEvent): void;
}

export function useInput(name: string, defaultValue: any): UseInputResult {
  const formContext = useContext(FormContext);

  if (formContext.type === FormType.INVALID) throw new Error("useInput must be used in a <Form>");
  if (formContext.type === FormType.ARRAY) throw new Error("useInput in an <ArrayForm> must be inside an <ArrayItemForm>");

  const {name: formName, form: {getValue, change, focus, blur, getError, listener, submitting}} = formContext;

  const [value, setValue] = useState(() => {
    let value = getValue(name);
    if (value === null) {
      value = defaultValue;
      change(name, defaultValue);
    }
    return value;
  });
  const [error, setError] = useState(() => getError(name));

  const changeEventHandler = useCallback(event => {
    if (event.detail.name === name && event.detail.form === formName) {
      setValue(event.detail.value);
    }
  }, [name, formName]);
  const errorEventHandler = useCallback(event => {
    if (event.detail.name === name && event.detail.form === formName) {
      setError(event.detail.error);
    }
  }, [name, formName]);

  useEventListener(listener, CHANGE_EVENT, changeEventHandler);
  useEventListener(listener, ERROR_EVENT, errorEventHandler);

  const handleChange = useCallback(event => {
    if (event.target) {
      change(name, event.target.value);
    } else {
      change(name, event);
    }
  }, [change, name]);

  const handleFocus = useCallback(() => {
    focus(name);
  }, [focus, name]);

  const handleBlur = useCallback(() => {
    blur(name);
  }, [blur, name]);

  return {
    value, error, handleChange, handleFocus, handleBlur, submitting
  };
}
