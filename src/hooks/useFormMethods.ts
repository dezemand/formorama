import {useRef} from "react";
import {FormController} from "../store/FormController";
import {Path, UnparsedPath} from "../store/Path";

export interface FormMethods<Values> {
  change<T>(uPath: UnparsedPath, value: T): void;

  getValue<T>(uPath: UnparsedPath): T;

  getError(uPath: UnparsedPath): any;

  hasTouched(uPath: UnparsedPath): boolean;

  isFocusing(uPath: UnparsedPath): boolean;

  modify<T>(modifier: (values: T) => T, uPath?: UnparsedPath): void;

  submit(): void;
}

export function useFormMethods<Values>(controller: FormController, path: Path): FormMethods<Values> {
  const methods = useRef({
    change<T>(uPath: UnparsedPath, value: T): void {
      controller.change(path.concat(Path.parse(uPath)), value);
    },
    getValue<T>(uPath: UnparsedPath): T {
      return controller.getValue(path.concat(Path.parse(uPath)));
    },
    getError(uPath: UnparsedPath) {
      return controller.getError(path.concat(Path.parse(uPath)));
    },
    hasTouched(uPath: UnparsedPath): boolean {
      return controller.hasTouched(path.concat(Path.parse(uPath)));
    },
    isFocusing(uPath: UnparsedPath): boolean {
      return controller.isFocusing(path.concat(Path.parse(uPath)));
    },
    modify<T>(modifier: (values: T) => T, uPath: UnparsedPath = Path.ROOT): void {
      controller.modify(modifier, path.concat(Path.parse(uPath)));
    },
    submit(): void {
      controller.submit();
    }
  });

  return methods.current;
}
