import { FC, ReactNode, useContext, useMemo } from "react";
import { FormContext } from "../contexts/FormContext";
import { FormCtx } from "../hooks/useForm";
import { PathNodeType } from "../store/Path";

interface ArrayFormItemProps {
  children?: ReactNode;
  index: number;
}

export function ArrayFormItem<RootValues = any>({
  children,
  index
}: ArrayFormItemProps): ReturnType<FC<ArrayFormItemProps>> {
  const parentCtx = useContext<FormCtx<RootValues>>(FormContext);
  const ctx = useMemo<FormCtx<RootValues>>(
    () => ({
      controller: parentCtx.controller,
      path: parentCtx.path.add([PathNodeType.ARRAY_INDEX, index])
    }),
    [index, parentCtx.controller, parentCtx.path]
  );

  return <FormContext.Provider value={ctx}>{children}</FormContext.Provider>;
}
