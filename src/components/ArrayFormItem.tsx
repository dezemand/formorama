import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useArrayFormItem} from "../hooks/useArrayFormItem";

interface ArrayFormItemProps {
  children?: ReactNode;
  index: number;
}

export function ArrayFormItem({children, index}: ArrayFormItemProps): ReturnType<FC<ArrayFormItemProps>> {
  const parent = useContext(FormContext);
  const arrayFormItem = useArrayFormItem(parent, index);

  return (
    <FormContext.Provider value={arrayFormItem}>
      {children}
    </FormContext.Provider>
  );
}
