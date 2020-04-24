import {useMemo} from "react";
import {FormHook, FormHookType, PathNodeType} from "../types";
import {useFormIO} from "./useFormIO";

export function useSubForm(parent: any, name: string): FormHook {
  const path = useMemo(() => [...parent.path, [PathNodeType.OBJECT_KEY, name]], [parent.path, name]);
  const io = useFormIO(parent.root, path);

  return {
    type: FormHookType.OBJECT,
    path,
    root: parent.root,
    ...io
  };
}
