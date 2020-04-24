import {useMemo} from "react";
import {FormHook, FormHookType, Path, PathNodeType} from "../types";
import {useFormIO} from "./useFormIO";

export function useArrayFormItem<Values = any, ParentValues = any, RootValues = any>(parent: FormHook<ParentValues, RootValues>, index: number): FormHook<Values, RootValues> {
  const path = useMemo<Path>(() => [...parent.path, [PathNodeType.ARRAY_INDEX, index]], [parent.path, index]);
  const io = useFormIO<Values>(parent.root, path);

  return {
    type: FormHookType.OBJECT,
    path,
    root: parent.root,
    ...io
  };
}
