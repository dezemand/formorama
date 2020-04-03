import {ChangeEvent, FocusEvent, useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT, CHANGE_MANY_EVENT, CustomChangeEvent, CustomChangeManyEvent, CustomErrorEvent, ERROR_EVENT} from "../events";
import {FormError, FormType} from "../types";
import {useEventListener} from "./useEventListener";

export interface UseInputResult {
  value: any;
  error: FormError | null;
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

  const [error, setError] = useState<FormError | null>(() => getError(name));

  const changeEventHandler = useCallback((event: CustomChangeEvent) => {
    if (event.detail.name === name && event.detail.form === formName) {
      setValue(event.detail.value);
    }
  }, [name, formName]);

  const errorEventHandler = useCallback((event: CustomErrorEvent) => {
    if (event.detail.name === name && event.detail.form === formName) {
      setError(event.detail.error);
    }
  }, [name, formName]);

  const changeManyEventHandler = useCallback((event: CustomChangeManyEvent) => {
    const updates = event.detail.updates;
    if (updates.has(formName) && (updates.get(formName) as Map<string, any>).has(name)) {
      change(name, (updates.get(formName) as Map<string, any>).get(name));
    }
  }, [name, formName, change]);

  useEventListener(listener, CHANGE_EVENT, changeEventHandler as EventListener);
  useEventListener(listener, ERROR_EVENT, errorEventHandler as EventListener);
  useEventListener(listener, CHANGE_MANY_EVENT, changeManyEventHandler as EventListener);

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
