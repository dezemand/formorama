import React, {useContext, useState} from "react";
import {ArrayFormItem} from "./ArrayFormItem";
import {FormContext} from "../contexts/FormContext";
import {FormType} from "../types";
import {useEventListener} from "../hooks/useEventListener";
import {CHANGE_EVENT, CHANGE_MANY_EVENT, CustomChangeEvent, CustomChangeManyEvent} from "../events";

interface ArrayFormItemsProps {
  children: (values: any, index: number) => any;

}

export function ArrayFormItems({children}: ArrayFormItemsProps): any {
  const formContext = useContext(FormContext);
  const [items, setItems] = useState([]);
  if (formContext.type !== FormType.ARRAY) throw new Error("<ArrayFormItems> must be in <ArrayForm>");

  const handleChangeEvent = (event: CustomChangeEvent) => {
    if (event.detail.form && event.detail.form.startsWith(formContext.name)) {
      setItems(formContext.form.getValues());
    }
  };

  const handleChangeManyEvent = (event: CustomChangeManyEvent) => {
    if ([...event.detail.updates.keys()].some(key => key && key.startsWith(formContext.name))) {
      setItems(formContext.form.getValues());
    }
  };


  useEventListener(formContext.form.listener, CHANGE_EVENT, handleChangeEvent as EventListener);
  useEventListener(formContext.form.listener, CHANGE_MANY_EVENT, handleChangeManyEvent as EventListener);

  return items.map((item, index) => (
    <ArrayFormItem index={index} key={`ArrayFormItem(${formContext.name})[${index}]`}>
      {children(item, index)}
    </ArrayFormItem>
  ));
}
