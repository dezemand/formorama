import { useEffect, useRef } from "react";
import { FormController, FormControllerParams } from "../store/FormController";
import { Path } from "../store/Path";
import { FormMethods, useFormMethods } from "./useFormMethods";
import { FormContextValue } from "../contexts/FormContext";

export interface UseForm<RootValues = any> extends FormMethods {
  ctx: FormContextValue<RootValues>;
}

export function useForm<RootValues>(params: FormControllerParams<RootValues> = {}): UseForm<RootValues> {
  const controller = useRef(new FormController<RootValues>(params));
  const methods = useFormMethods(controller.current, Path.ROOT);
  const result = useRef<UseForm<RootValues>>({
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
