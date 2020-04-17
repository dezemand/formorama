import React, {FC, ReactNode, useContext} from "react";
import {ArrayFormItem} from "./ArrayFormItem";
import {FormContext} from "../contexts/FormContext";
import {ArrayFormContextValue} from "../types";
import {useInputArrayValues} from "../hooks/useInputArrayValues";

interface ArrayFormItemsChildrenParameters {
  values: any;
  index: number;

  remove(): void;
}

interface ArrayFormItemsProps {
  children: (options: ArrayFormItemsChildrenParameters) => ReactNode;
}

export function ArrayFormItems({children}: ArrayFormItemsProps): ReturnType<FC<ArrayFormItemsProps>> {
  const {name, form} = useContext(FormContext) as ArrayFormContextValue<any>;
  useInputArrayValues(form);

  const removeItem = (index: number) => {
    form.modify(arr => arr.filter((_: any, i: number) => i !== index));
  };

  return (
    <>
      {form.getValues().map((values: any, index: number) => (
        <ArrayFormItem index={index} key={`ArrayFormItem(${name},${form.version},${index})`}>
          {children({
            values,
            index,
            remove: () => removeItem(index)
          })}
        </ArrayFormItem>
      ))}
    </>
  );
}
