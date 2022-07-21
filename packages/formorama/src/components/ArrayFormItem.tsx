import { ReactElement, ReactNode, useContext, useMemo } from "react";
import { FormContext, FormContextValue } from "../contexts/FormContext";
import { PathNodeType } from "../store/Path";

interface ArrayFormItemProps {
  children?: ReactNode;
  index: number;
}

export function ArrayFormItem<RootValues = any>({ children, index }: ArrayFormItemProps): ReactElement {
  const parentCtx = useContext<FormContextValue<RootValues>>(FormContext);
  const ctx = useMemo<FormContextValue<RootValues>>(
    () => ({
      controller: parentCtx.controller,
      path: parentCtx.path.add([PathNodeType.ARRAY_INDEX, index])
    }),
    [index, parentCtx.controller, parentCtx.path]
  );

  return <FormContext.Provider value={ctx}>{children}</FormContext.Provider>;
}
