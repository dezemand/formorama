import {useCallback} from "react";
import {FormIOHook, Path, RootForm, UnparsedPath} from "../types";
import {parsePath} from "../utils/path";

export function useFormIO<Values = any, RootValues = any>(root: RootForm<RootValues>, path: Path): FormIOHook<Values> {
  const {getValue: _getValue, change: _change} = root;

  const getValues = useCallback(() => _getValue(path), [_getValue, path]);

  const getValue = useCallback((subPath: UnparsedPath) => _getValue([...path, ...parsePath(subPath)]), [_getValue, path]);

  const change = useCallback((subPath: UnparsedPath, value: any) => _change([...path, ...parsePath(subPath)], value), [_change, path]);

  const modify = useCallback((modifier) => _change(path, modifier(_getValue(path))), [_change, _getValue, path]);

  return {
    getValues,
    getValue,
    change,
    modify
  };
}
