import {useMemo} from "react";
import {PathNodeType} from "../store/Path";
import {FormHook, FormHookType, Path} from "../types";
import {useFormIO} from "./useFormIO";

export function useArrayForm<Values = any, ParentValues = any, RootValues = any>(parent: FormHook<ParentValues, RootValues>, name: string): FormHook<Values, RootValues> {
  const path = useMemo<Path>(() => [...parent.path, [PathNodeType.OBJECT_KEY, name]], [parent.path, name]);
  const io = useFormIO<Values>(parent.root, path);

  return {
    type: FormHookType.ARRAY,
    path,
    root: parent.root,
    ...io
  };
}
