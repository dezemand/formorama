import React, {FC, ReactNode, useContext, useRef} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormCtx} from "../hooks/useForm";
import {PathNodeType} from "../store/Path";

interface ArrayFormItemProps {
  children?: ReactNode;
  index: number;
}

export function ArrayFormItem<RootValues = any>({children, index}: ArrayFormItemProps): ReturnType<FC<ArrayFormItemProps>> {
  const parentCtx = useContext<FormCtx<RootValues>>(FormContext);
  const ctx = useRef<FormCtx<RootValues>>({
    controller: parentCtx.controller,
    path: parentCtx.path.add([PathNodeType.ARRAY_INDEX, index])
  });

  return (
    <FormContext.Provider value={ctx.current}>
      {children}
    </FormContext.Provider>
  );
}
