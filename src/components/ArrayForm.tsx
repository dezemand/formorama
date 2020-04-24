import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useArrayForm} from "../hooks/useArrayForm";

interface ArrayFormProps {
  children?: ReactNode;
  name: string;
}

export function ArrayForm({children, name}: ArrayFormProps): ReturnType<FC<ArrayFormProps>> {
  const parent = useContext(FormContext);
  const arrayForm = useArrayForm(parent, name);

  return (
    <FormContext.Provider value={arrayForm}>
      {children}
    </FormContext.Provider>
  );
}
