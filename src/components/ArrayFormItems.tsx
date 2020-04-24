import React, {ComponentClass, createElement, FC, FunctionComponent, ReactNode, useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT, CustomChangeEvent} from "../events";
import {useEventListener} from "../hooks/useEventListener";
import {pathParentOf} from "../utils/path";
import {ArrayFormItem} from "./ArrayFormItem";

interface ArrayFormItemsChildrenParams {
  values: any;
  index: number;

  remove(): void;
}

interface ArrayFormItemsPropsUsingChildren {
  children: (options: ArrayFormItemsChildrenParams) => ReactNode;
  component: undefined | null;
}

interface ArrayFormItemsPropsUsingComponent {
  component: FunctionComponent<ArrayFormItemsChildrenParams> | ComponentClass<ArrayFormItemsChildrenParams> | string;
  children: undefined | null;
}

type ArrayFormItemsProps = ArrayFormItemsPropsUsingChildren | ArrayFormItemsPropsUsingComponent;

export function ArrayFormItems({children, component}: ArrayFormItemsProps): ReturnType<FC<ArrayFormItemsProps>> {
  const form = useContext(FormContext);
  const {getValues, change} = form;
  const [items, setItems] = useState<any[]>(() => getValues());

  const handleChange = useCallback((event: CustomChangeEvent) => {
    for (const {path} of event.detail.values) {
      if (pathParentOf(form.path, path)) {
        setItems(getValues());
      }
    }
  }, [form.path, getValues]);

  useEventListener(form.root.target, CHANGE_EVENT, handleChange as EventListener);

  const removeItem = (index: number) => {
    change([], getValues().filter((_: any, i: number) => i !== index));
  };

  const getItemElement = (values: any, index: number) => (
    children ? (
      children({values, index, remove: () => removeItem(index)})
    ) : (component ? (
      createElement(component, {values, index, remove: () => removeItem(index)})
    ) : null)
  );

  return (
    <>
      {(items || []).map((values, index) => (
        <ArrayFormItem index={index} key={`item${index}`}>
          {getItemElement(values, index)}
        </ArrayFormItem>
      ))}
    </>
  );
}
