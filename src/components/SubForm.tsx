import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useSubForm} from "../hooks/useSubForm";

interface SubFormProps {
  children?: ReactNode;
  name: string;
}

export function SubForm({children, name}: SubFormProps): ReturnType<FC<SubFormProps>> {
  const parent = useContext(FormContext);
  const subForm = useSubForm(parent, name);

  return (
    <FormContext.Provider value={subForm}>
      {children}
    </FormContext.Provider>
  );
}
