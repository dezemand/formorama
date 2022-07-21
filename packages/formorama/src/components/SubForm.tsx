import { ReactElement, ReactNode, useContext, useMemo } from "react";
import { FormContext, FormContextValue } from "../contexts/FormContext";
import { PathNodeType } from "../store/Path";

interface SubFormProps {
  children?: ReactNode;
  name: string;
}

export function SubForm<RootValues = any>({ children, name }: SubFormProps): ReactElement {
  const parentCtx = useContext<FormContextValue<RootValues>>(FormContext);
  const ctx = useMemo<FormContextValue<RootValues>>(
    () => ({
      controller: parentCtx.controller,
      path: parentCtx.path.add([PathNodeType.OBJECT_KEY, name])
    }),
    [name, parentCtx.controller, parentCtx.path]
  );

  return <FormContext.Provider value={ctx}>{children}</FormContext.Provider>;
}
