import React, {
  ComponentClass,
  createElement,
  FC,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useState
} from "react";
import {FormContext} from "../contexts/FormContext";
import {CustomChangeEvent, POST_CHANGE_EVENT} from "../events";
import {useEventListener} from "../hooks/useEventListener";
import {pathParentOf} from "../utils/path";
import {ArrayFormItem} from "./ArrayFormItem";
import {FormHook} from "../types";

export interface ArrayFormItemsChildrenParams<Values> {
  values: Values;
  index: number;

  remove(): void;
}

interface ArrayFormItemsProps<ParentValues extends Array<ParentValues>> {
  component?: FunctionComponent<ArrayFormItemsChildrenParams<ParentValues[0]>> | ComponentClass<ArrayFormItemsChildrenParams<ParentValues[0]>> | string;

  children?(options: ArrayFormItemsChildrenParams<ParentValues[0]>): ReactNode;

  getKey?(values: ParentValues[0], index: number): any;
}

function defaultGetKey(_: unknown, index: number): any {
  return `ArrayFormItems(${index})`;
}

export function ArrayFormItems<ParentValues extends Array<ParentValues> = any[], RootValues = any>({children, component, getKey}: ArrayFormItemsProps<ParentValues>): ReturnType<FC<ArrayFormItemsProps<ParentValues>>> {
  const form = useContext<FormHook<ParentValues, RootValues>>(FormContext);
  const {getValues, change} = form;
  const [items, setItems] = useState<ParentValues[0][]>(() => {
    const parentValues = getValues() || [];
    if (!Array.isArray(parentValues)) throw new Error("Parent form should be an array");
    return [...(parentValues)];
  });

  const handleChange = useCallback((event: CustomChangeEvent) => {
    if (event.detail.values.some(({path}) => pathParentOf(form.path, path))) {
      setItems([...(getValues() || [])]);
    }
  }, [form.path, getValues]);

  useEventListener(form.root.target, POST_CHANGE_EVENT, handleChange as EventListener);

  const removeItem = (index: number) => {
    const parentValues = getValues() || [];
    if (!Array.isArray(parentValues)) throw new Error("Parent form should be an array");
    change([], [...(parentValues)].filter((_, i) => i !== index));
  };

  const getItemElement = (values: ParentValues[0], index: number) => (
    children ? (
      children({values, index, remove: () => removeItem(index)} as ArrayFormItemsChildrenParams<ParentValues[0]>)
    ) : (component ? (
      createElement(component, {
        values,
        index,
        remove: () => removeItem(index)
      } as ArrayFormItemsChildrenParams<ParentValues[0]>)
    ) : null)
  );

  return (
    <>
      {(items || []).map((values: ParentValues[0], index) => (
        <ArrayFormItem index={index} key={(getKey || defaultGetKey)(values, index)}>
          {getItemElement(values, index)}
        </ArrayFormItem>
      ))}
    </>
  );
}
