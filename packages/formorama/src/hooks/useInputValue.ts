import { useCallback, useContext, useMemo, useState } from "react";
import { FormContext } from "../contexts/FormContext";
import { CHANGE_EVENT } from "../events";
import { Change } from "../store/Change";
import { FormValues } from "../store/FormValues";
import { Path, UnparsedPath } from "../store/Path";
import { useEventEmitter } from "./useEventEmitter";
import { FormCtx, FormHook } from "./useForm";

type NullableArray<T> = T extends unknown[] ? { [K in keyof T]: T[K] | null } : never;

export function useInputValue<Values extends any[] = any[]>(
  fields: { [K in keyof Values]: UnparsedPath },
  form?: FormHook,
  uPath?: UnparsedPath
): NullableArray<Values> {
  const context = useContext<FormCtx>(FormContext);
  const ctx = (form && form.ctx) || context;
  const path = uPath ? Path.parse(uPath) : ctx.path;
  const fieldPaths = useMemo(() => fields.map((field) => path.concat(Path.parse(field))), [fields, path]);

  const [result, setResult] = useState<[Path, FormValues][]>(
    fieldPaths.map((fieldPath) => [fieldPath, new FormValues(ctx.controller.getValue(fieldPath))])
  );

  const changeListener = useCallback<(changes: Change[]) => void>(
    (changes) =>
      setResult((result) => {
        const newResult = [...result];
        const updated: boolean[] = Array(newResult.length).fill(false);

        for (const [index, [path, value]] of newResult.entries()) {
          const subChanges = Change.subChanges(changes, path);
          updated[index] = subChanges.length > 0;
          newResult[index] = [path, value.apply(subChanges)];
        }

        return updated.some(Boolean) ? newResult : result;
      }),
    []
  );

  useEventEmitter(ctx.controller, CHANGE_EVENT, changeListener);

  return result.map((res) => res[1].values.raw) as NullableArray<Values>;
}
