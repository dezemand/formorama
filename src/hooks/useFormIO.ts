import {useCallback} from "react";
import {FormIOHook, Path, RootForm} from "../types";

export function useFormIO(root: RootForm, path: Path): FormIOHook {
  const {getValue: _getValue, change: _change} = root;

  const getValues = useCallback(() => _getValue(path), [_getValue, path]);

  const getValue = useCallback((subPath: Path) => _getValue([...path, ...subPath]), [_getValue, path]);

  const change = useCallback((subPath: Path, value: any) => _change([...path, ...subPath], value), [_change, path]);

  const modify = useCallback((modifier) => _change(path, modifier(_getValue(path))), [_change, _getValue, path]);

  return {
    getValues,
    getValue,
    change,
    modify
  };
}
