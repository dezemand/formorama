import {useEffect, useRef} from "react";
import {FormController, FormControllerParams} from "../store/FormController";
import {Path} from "../store/Path";
import {FormMethods, useFormMethods} from "./useFormMethods";

export interface FormCtx<RootValues = any> {
  controller: FormController<RootValues>;
  path: Path;
}

export interface FormHook<RootValues = any, Values = any> extends FormMethods<Values> {
  ctx: FormCtx<RootValues>;
}

export function useForm<RootValues>(params: FormControllerParams<RootValues> = {}): FormHook<RootValues> {
  const controller = useRef(new FormController<RootValues>(params));
  const methods = useFormMethods(controller.current, Path.ROOT);
  const result = useRef<FormHook<RootValues, RootValues>>({
    ctx: {
      path: Path.ROOT,
      controller: controller.current
    },
    ...methods
  });
  useEffect(() => {
    controller.current.params = params;
  }, [params]);
  return result.current;
}
