import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormType} from "../types";
import {useArrayFormItem} from "../hooks/useArrayFormItem";

interface ArrayFormItemProps {
  children?: ReactNode;
  index: number;
}

export function ArrayFormItem({children, index}: ArrayFormItemProps): ReturnType<FC<ArrayFormItemProps>> {
  const formContext = useContext(FormContext);

  if (formContext.type !== FormType.ARRAY) throw new Error("<ArrayFormItem> must be in <ArrayForm>");

  const arrayFormItem = useArrayFormItem(formContext.form, index);

  return (
    <FormContext.Provider
      value={{type: FormType.OBJECT, name: arrayFormItem.internal.name as string, form: arrayFormItem}}>
      {children}
    </FormContext.Provider>
  );
}
