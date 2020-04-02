import React, {FC, ReactNode} from "react";
import {UseFormResult} from "..";

interface ArrayFormProps<T> {
  children?: ReactNode;
  name: string;
  form: UseFormResult<T>;
}

export function ArrayForm<T extends any>({children, name, form}: ArrayFormProps<T>): ReturnType<FC<ArrayFormProps<T>>> {

  return <>Not implemented</>;
  // return (
  //   <FormContext.Provider value={{form: subForm, name: subForm.internal.name}}>
  //     {children}
  //   </FormContext.Provider>
  // )
}
