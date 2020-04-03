import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useSubForm} from "../hooks/useSubForm";
import {FormType} from "../types";

interface SubFormProps {
  children?: ReactNode;
  name: string;
}

export function SubForm({children, name}: SubFormProps): ReturnType<FC<SubFormProps>> {
  const formContext = useContext(FormContext);

  if (formContext.type !== FormType.ROOT && formContext.type !== FormType.OBJECT) throw new Error("<SubForm> must be in <Form> or <SubForm> or <ArrayFormItem>");

  const subForm = useSubForm(formContext.form, name);

  return (
    <FormContext.Provider value={{type: FormType.OBJECT, name: subForm.internal.name as string, form: subForm}}>
      {children}
    </FormContext.Provider>
  );
}
