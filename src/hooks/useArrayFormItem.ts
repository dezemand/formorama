import {useMemo} from "react";
import {PathNodeType} from "../store/Path";
import {FormHook, FormHookType, Path} from "../types";
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
