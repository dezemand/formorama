import {useCallback, useContext, useMemo, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT} from "../events";
import {Path, UnparsedPath} from "../store/Path";
import {useEventEmitter} from "./useEventEmitter";
import {FormCtx, FormHook} from "./useForm";

export function useInputValue(fields: (UnparsedPath)[], form?: FormHook, uPath?: UnparsedPath): any[] {
  const context = useContext<FormCtx>(FormContext);
  const ctx = (form && form.ctx) || context;
  const path = uPath ? Path.parse(uPath) : ctx.path;
  const fieldPaths = useMemo(() => fields.map(field => path.concat(Path.parse(field))), [fields, path]);

  const [result, setResult] = useState<any[]>(fieldPaths.map(fieldPath => ctx.controller.getValue(fieldPath)));

  const changeListener = useCallback(changes => {

  }, []);

  useEventEmitter(ctx.controller, CHANGE_EVENT, changeListener);

  return result;
}
