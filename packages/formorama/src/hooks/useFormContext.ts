import { useContext, useRef } from "react";
import { FormContext, FormContextValue } from "../contexts/FormContext";
import { UnparsedPath } from "../store/Path";
import { UseForm } from "./useForm";
import { useFormMethods } from "./useFormMethods";
import { parsePath } from "../utils/parsePath";

export function useFormContext<RootValues = any>(path?: UnparsedPath): UseForm<RootValues> {
  const ctx = useContext<FormContextValue<RootValues>>(FormContext);
  const methods = useFormMethods(ctx.controller, path ? parsePath(path) : ctx.path);
  const result = useRef<UseForm<RootValues>>({
    ctx,
    ...methods
  });
  return result.current;
}
