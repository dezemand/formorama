import { FC, ReactNode, useContext, useMemo } from "react";
import { FormContext } from "../contexts/FormContext";
import { FormCtx } from "../hooks/useForm";
import { PathNodeType } from "../store/Path";

interface SubFormProps {
  children?: ReactNode;
  name: string;
}

export function SubForm<RootValues = any>({ children, name }: SubFormProps): ReturnType<FC<SubFormProps>> {
  const parentCtx = useContext<FormCtx<RootValues>>(FormContext);
  const ctx = useMemo<FormCtx<RootValues>>(
    () => ({
      controller: parentCtx.controller,
      path: parentCtx.path.add([PathNodeType.OBJECT_KEY, name])
    }),
    [name, parentCtx.controller, parentCtx.path]
  );

  return <FormContext.Provider value={ctx}>{children}</FormContext.Provider>;
}
