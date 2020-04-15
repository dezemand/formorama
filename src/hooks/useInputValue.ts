import {useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT} from "../events";
import {FormType} from "../types";
import {useEventListener} from "./useEventListener";

export function useInputValue(fields: string[], form: any): any[] {
  const formContext = useContext(FormContext);

  if (!form) {
    if (formContext.type === FormType.INVALID) throw new Error("useInputValue must be used in a <Form>");
    if (formContext.type === FormType.ARRAY) throw new Error("useInputValue in an <ArrayForm> must be inside an <ArrayItemForm>");

    form = formContext.form;
  }

  const {getValue, listener} = form;

  const [values, setValues] = useState<any[]>(() => fields.map(field => getValue(field)));

  const handleChange = useCallback((event: CustomEvent) => {
    const valueIndex = fields.indexOf(event.detail.name);
    if (valueIndex !== -1 && event.detail.form === formContext.name) {
      const newValues = [...values];
      newValues[valueIndex] = event.detail.value;
      setValues(newValues);
    }
  }, [fields, values, formContext.name]);

  useEventListener(listener, CHANGE_EVENT, handleChange as EventListener);

  return values;
}
