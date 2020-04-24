import {useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT, CustomChangeEvent} from "../events";
import {FormHook, Path, UnparsedPath} from "../types";
import {parsePath, pathEquals} from "../utils/path";
import {useEventListener} from "./useEventListener";

export function useInputValue(fields: (UnparsedPath)[], form?: FormHook, uPath?: UnparsedPath): any[] {
  const formContext = useContext(FormContext);
  form = form || formContext;
  const path = uPath ? parsePath(uPath) : form.path;
  const fieldPaths: Path[] = fields.map(field => [...path, ...parsePath(field)]);

  const {root: {getValue, target}} = form;

  const [values, setValues] = useState<any[]>(() => fieldPaths.map(fieldPath => getValue(fieldPath)));

  const handleChange = useCallback((event: CustomChangeEvent) => {
    for (const {path: valuePath, value} of event.detail.values) {
      for (const [index, fieldPath] of fieldPaths.entries()) {
        if (pathEquals(valuePath, fieldPath)) {
          const newValues = [...values];
          newValues[index] = value;
          setValues(newValues);
        }
      }
    }
  }, [fieldPaths, values]);

  useEventListener(target, CHANGE_EVENT, handleChange as EventListener);

  return values;
}
