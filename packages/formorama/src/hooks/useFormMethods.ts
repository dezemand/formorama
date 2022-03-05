import { useRef } from "react";
import { FormController } from "../store/FormController";
import { Path, UnparsedPath } from "../store/Path";
import { NullableField } from "../types";

export interface FormMethods {
  change<T>(uPath: UnparsedPath, value: T): void;

  getValue<T>(uPath: UnparsedPath): T;

  getError(uPath: UnparsedPath): any;

  hasTouched(uPath: UnparsedPath): boolean;

  isFocusing(uPath: UnparsedPath): boolean;

  modify<T>(modifier: (values: NullableField<T>) => NullableField<T>, uPath?: UnparsedPath): void;

  submit(): void;
}

export function useFormMethods(controller: FormController, path: Path): FormMethods {
  const methods = useRef<FormMethods>({
    change(uPath, value) {
      controller.change(path.concat(Path.parse(uPath)), value);
    },
    getValue(uPath) {
      return controller.getValue(path.concat(Path.parse(uPath)));
    },
    getError(uPath) {
      return controller.getErrors(path.concat(Path.parse(uPath)));
    },
    hasTouched(uPath) {
      return controller.hasTouched(path.concat(Path.parse(uPath)));
    },
    isFocusing(uPath) {
      return controller.isFocusing(path.concat(Path.parse(uPath)));
    },
    modify(modifier, uPath = Path.ROOT) {
      controller.modify(modifier, path.concat(Path.parse(uPath)));
    },
    submit() {
      controller.submit();
    }
  });

  return methods.current;
}
