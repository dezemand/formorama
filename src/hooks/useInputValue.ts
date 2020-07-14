import {useCallback, useContext, useMemo, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT} from "../events";
import {Change} from "../store/Change";
import {ImmutableValuesTree} from "../store/ImmutableValuesTree";
import {Path, UnparsedPath} from "../store/Path";
import {useEventEmitter} from "./useEventEmitter";
import {FormCtx, FormHook} from "./useForm";

export function useInputValue(fields: (UnparsedPath)[], form?: FormHook, uPath?: UnparsedPath): any[] {
  const context = useContext<FormCtx>(FormContext);
  const ctx = (form && form.ctx) || context;
  const path = uPath ? Path.parse(uPath) : ctx.path;
  const fieldPaths = useMemo(() => fields.map(field => path.concat(Path.parse(field))), [fields, path]);

  const [result, setResult] = useState<[Path, any][]>(fieldPaths.map(fieldPath => [fieldPath, ctx.controller.getValue(fieldPath)]));

  const changeListener = useCallback((changes: Change[]) => {
    const newResult = [...result];
    let updated = false;

    for (const [index, [path, value]] of newResult.entries()) {
      let tree = new ImmutableValuesTree(value);

      for (const change of changes) {
        if (path.parentOf(change.path)) {
          updated = true;
          tree = tree.set(change.path.slice(path.nodes.length), change.value);
        }
      }

      newResult[index] = [path, tree.raw];
    }

    if (updated) {
      setResult(newResult);
    }
  }, [result]);

  useEventEmitter(ctx.controller, CHANGE_EVENT, changeListener);

  return result;
}
