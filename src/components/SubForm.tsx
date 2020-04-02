import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useSubForm} from "../hooks/useSubForm";

interface SubFormProps<T> {
  children?: ReactNode;
  name: string;
}

export function SubForm<T extends any>({children, name}: SubFormProps<T>): ReturnType<FC<SubFormProps<T>>> {
  const {form} = useContext(FormContext);
  const subForm = useSubForm(form, name);

  return (
    <FormContext.Provider value={{form: subForm, name: subForm.internal.name}}>
      {children}
    </FormContext.Provider>
  );
}
