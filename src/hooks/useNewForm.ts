import {useMemo, useRef} from "react";
import {FormController} from "../store/FormController";
import {Path} from "../store/Path";
import {RootFormFunctions} from "../types";
import {UseFormParameters} from "./useForm";

export function useNewForm<Values>(params: UseFormParameters<Values> = {}): any {
  const controller = useRef(new FormController<Values>());

  const rootFunctions = useRef<RootFormFunctions<Values>>({
    getValues() {
      return controller.current.getValue(Path.ROOT);
    },

    setErrors(errors: any) {
      return [false, null];
    },

    getValue(uPath) {
      return controller.current.getValue(Path.parse(uPath));
    },

    getError(uPath) {
      return controller.current.getError(Path.parse(uPath));
    },

    change(uPath, value) {
      controller.current.change(Path.parse(uPath), value);
    },

    focus(uPath) {
      controller.current.focus(Path.parse(uPath));
    },

    blur(uPath) {
      controller.current.blur(Path.parse(uPath));
    },

    submit() {
      controller.current.submit();
    },

    async getValidationResult(valuesObject) {
      // if (!paramsRef.current.validate) return [false, []];
      // return setErrors.current(await paramsRef.current.validate(valuesObject || getValues.current()));
      return [false, null];
    },

    isFocused(uPath) {
      return controller.current.isFocusing(Path.parse(uPath));
    }
  });


  return useMemo(() => ({
    controller: controller.current,
    path: Path.ROOT
  }), []);
}
