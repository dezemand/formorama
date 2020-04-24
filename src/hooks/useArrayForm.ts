import {useMemo} from "react";
import {FormHook, FormHookType, Path, PathNodeType} from "../types";
import {useFormIO} from "./useFormIO";

export function useArrayForm(parent: FormHook, name: string): FormHook {
  const path = useMemo<Path>(() => [...parent.path, [PathNodeType.OBJECT_KEY, name]], [parent.path, name]);
  const io = useFormIO(parent.root, path);

  return {
    type: FormHookType.ARRAY,
    path,
    root: parent.root,
    ...io
  };
}
