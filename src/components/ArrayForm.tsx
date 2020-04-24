import React, {FC, ReactNode, useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {useArrayForm} from "../hooks/useArrayForm";
import {FormHook} from "../types";

interface ArrayFormProps {
  children?: ReactNode;
  name: string;
}

export function ArrayForm<Values = any, ParentValues = any, RootValues = any>({children, name}: ArrayFormProps): ReturnType<FC<ArrayFormProps>> {
  const parent = useContext<FormHook<ParentValues, RootValues>>(FormContext);
  const arrayForm = useArrayForm<Values, ParentValues, RootValues>(parent, name);

  return (
    <FormContext.Provider value={arrayForm}>
      {children}
    </FormContext.Provider>
  );
}
