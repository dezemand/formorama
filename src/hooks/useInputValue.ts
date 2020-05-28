import {useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {CHANGE_EVENT, CustomChangeEvent} from "../events";
import {FormHook, Path, PathNodeType, UnparsedPath} from "../types";
import {parsePath, pathEquals, pathParentOf, setTreeValue} from "../utils/path";
import {useEventListener} from "./useEventListener";

export function useInputValue(fields: (UnparsedPath)[], form?: FormHook, uPath?: UnparsedPath): any[] {
  const formContext = useContext(FormContext);
  form = form || formContext;
  const path = uPath ? parsePath(uPath) : form.path;
  const fieldPaths: Path[] = fields.map(field => [...path, ...parsePath(field)]);

  const {root: {getValue, target}} = form;

  const [values, setValues] = useState<any[]>(() => fieldPaths.map(fieldPath => getValue(fieldPath)));

  const handleChange = useCallback((event: CustomChangeEvent) => {
    const newValues = [...values];
    let changed = false;

    for (const {path: valuePath, value} of event.detail.values) {
      for (const [index, fieldPath] of fieldPaths.entries()) {
        if (pathEquals(valuePath, fieldPath)) {
          newValues[index] = value;
          changed = true;
        } else if (pathParentOf(fieldPath, valuePath)) {
          const subPath = valuePath.slice(fieldPath.length);
          const tree = newValues[index] || (subPath[0][0] === PathNodeType.ARRAY_INDEX ? [] : {});
          setTreeValue(tree, subPath, value);
          newValues[index] = tree;
          changed = true;
        }
      }
    }

    if (changed) {
      setValues(newValues);
    }
  }, [fieldPaths, values]);

  useEventListener(target, CHANGE_EVENT, handleChange as EventListener);

  return values;
}
