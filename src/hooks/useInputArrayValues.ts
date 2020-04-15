import {useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {ArrayFormHook, FormType} from "../types";
import {CHANGE_EVENT, CHANGE_MANY_EVENT, CustomChangeEvent, CustomChangeManyEvent} from "../events";
import {useEventListener} from "./useEventListener";
import {isFormParentOf} from "../utils/isFormParentOf";

export function useInputArrayValues(form?: ArrayFormHook<any>): any[] {
  const formContext = useContext(FormContext);

  if (!form) {
    if (formContext.type !== FormType.ARRAY) throw new Error("useInputArrayValues() must be in <ArrayForm>");
    form = formContext.form;
  }

  const {getValues, listener, internal: {name: formName}} = form;
  const [values, setValues] = useState(() => getValues());

  const handleChangeEvent = (event: CustomChangeEvent) => {
    if (isFormParentOf(formName, event.detail.form)) {
      setValues(getValues());
    }
  };

  const handleChangeManyEvent = (event: CustomChangeManyEvent) => {
    if ([...event.detail.updates.keys()].some(key => isFormParentOf(formName, key))) {
      setValues(getValues());
    }
  };

  useEventListener(listener, CHANGE_EVENT, handleChangeEvent as EventListener);
  useEventListener(listener, CHANGE_MANY_EVENT, handleChangeManyEvent as EventListener);

  return values;
}
