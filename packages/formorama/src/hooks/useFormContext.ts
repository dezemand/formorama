import { useContext, useRef } from "react";
import { FormContext } from "../contexts/FormContext";
import { Path } from "../store/Path";
import { FormCtx, FormHook } from "./useForm";
import { useFormMethods } from "./useFormMethods";

export function useFormContext<RootValues = any>(path?: Path): FormHook<RootValues> {
  const ctx = useContext<FormCtx<RootValues>>(FormContext);
  const methods = useFormMethods(ctx.controller, path || ctx.path);
  const result = useRef<FormHook<RootValues>>({
    ctx,
    ...methods
  });
  return result.current;
}
