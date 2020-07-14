import React, {FC, ReactNode, useContext, useRef} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormCtx} from "../hooks/useForm";
import {PathNodeType} from "../store/Path";

interface ArrayFormProps {
  children?: ReactNode;
  name: string;
}

export function ArrayForm<Values = any, ParentValues = any, RootValues = any>({children, name}: ArrayFormProps): ReturnType<FC<ArrayFormProps>> {
  const parentCtx = useContext<FormCtx>(FormContext);
  const ctx = useRef<FormCtx>({
    controller: parentCtx.controller,
    path: parentCtx.path.add([PathNodeType.OBJECT_KEY, name])
  });

  return (
    <FormContext.Provider value={ctx.current}>
      {children}
    </FormContext.Provider>
  );
}
