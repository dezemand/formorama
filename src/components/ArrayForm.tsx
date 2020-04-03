import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useArrayForm} from "../hooks/useArrayForm";
import {ArrayFormContextValue, FormType} from "../types";

interface ArrayFormProps {
  children?: ReactNode;
  name: string;
}

export function ArrayForm<T extends any>({children, name}: ArrayFormProps): ReturnType<FC<ArrayFormProps>> {
  const formContext = useContext(FormContext);

  if (formContext.type !== FormType.ROOT && formContext.type !== FormType.OBJECT) throw new Error("<ArrayForm> must be in <Form> or <SubForm> or <ArrayFormItem>");

  const arrayForm = useArrayForm(formContext.form, name);

  const contextValue: ArrayFormContextValue<T> = {
    type: FormType.ARRAY as FormType.ARRAY,
    name: arrayForm.internal.name as string,
    form: arrayForm
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
}
