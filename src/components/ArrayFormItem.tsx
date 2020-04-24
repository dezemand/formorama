import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useArrayFormItem} from "../hooks/useArrayFormItem";
import {FormHook} from "../types";

interface ArrayFormItemProps {
  children?: ReactNode;
  index: number;
}

export function ArrayFormItem<Values = any, ParentValues = any, RootValues = any>({children, index}: ArrayFormItemProps): ReturnType<FC<ArrayFormItemProps>> {
  const parent = useContext<FormHook<ParentValues, RootValues>>(FormContext);
  const arrayFormItem = useArrayFormItem<Values, ParentValues, RootValues>(parent, index);

  return (
    <FormContext.Provider value={arrayFormItem}>
      {children}
    </FormContext.Provider>
  );
}
