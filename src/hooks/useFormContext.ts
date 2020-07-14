import {useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormCtx, FormHook} from "./useForm";
import {useFormMethods} from "./useFormMethods";

export function useFormContext<Values = any, RootValues = any>(): FormHook<RootValues, Values> {
  const ctx = useContext<FormCtx<RootValues>>(FormContext);
  const methods = useFormMethods<Values>(ctx.controller, ctx.path);
  return {
    ctx,
    ...methods
  };
}
