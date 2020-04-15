import React, {FC, ReactNode, useContext} from "react";
import {ArrayFormItem} from "./ArrayFormItem";
import {FormContext} from "../contexts/FormContext";
import {useInputArrayValues} from "..";
import {ArrayFormHook} from "../types";

interface ArrayFormItemsChildrenParameters {
  values: any;
  index: number;

  remove(): void;
}

interface ArrayFormItemsProps {
  children: (options: ArrayFormItemsChildrenParameters) => ReactNode;
}

export function ArrayFormItems({children}: ArrayFormItemsProps): ReturnType<FC<ArrayFormItemsProps>> {
  const {name, form} = useContext(FormContext);
  const arrayItems = useInputArrayValues();

  return (
    <>
      {arrayItems.map((values, index) => (
        <ArrayFormItem index={index} key={`ArrayFormItem(${name})[${index}]`}>
          {children({
            values,
            index,
            remove: () => (form as ArrayFormHook<any>).splice(index, 1)
          })}
        </ArrayFormItem>
      ))}
    </>
  );
}
