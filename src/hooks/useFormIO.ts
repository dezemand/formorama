import {useMemo} from "react";
import {FormIOHook, Path, RootForm} from "../types";
import {parsePath} from "../utils/path";

export function useFormIO<Values = any, RootValues = any>(root: RootForm<RootValues>, path: Path): FormIOHook<Values> {
  const {getValue, change, submit} = root;

  return useMemo<FormIOHook<Values>>(() => ({
    getValues(): Values {
      return getValue(path);
    },
    getValue(subPath) {
      return getValue([...path, ...parsePath(subPath)]);
    },
    change(subPath, value) {
      change([...path, ...parsePath(subPath)], value);
    },
    modify(modifier): void {
      change(path, modifier(getValue(path)));
    },
    submit(): void {
      submit();
    }
  }), [change, getValue, submit, path]);
}
