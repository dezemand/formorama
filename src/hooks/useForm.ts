import {useMemo, useRef, useState} from "react";
import {BLUR_EVENT, CHANGE_EVENT, ChangeEventDetail, DO_SUBMIT_EVENT, FOCUS_EVENT, FocusBlurEventDetail} from "../events";
import {ErrorObject, FormError, FormHook, FormHookType, Path, RootForm} from "../types";
import {createChangesMap, createErrorsMap} from "../utils/changes";
import {getTreeValue, pathEquals, ROOT_PATH, setTreeValue} from "../utils/path";
import {useFormIO} from "./useFormIO";

export interface UseFormParameters<T> {
  validate?(values: T): ErrorObject;
}

// const getValidationResult = useCallback<RootFormHookInternal<T>["getValidationResult"]>(async (valuesObject) => {
//   if (!validate) return [false, []];
//
//   let errored = false;
//   const formErrors = await validate(valuesObject || getValues());
//   const formErrorsMap = new Map(formErrors);
//
//   for (const field of values.current.keys()) {
//     if (formErrorsMap.get(field)) {
//       errored = true;
//       const error = formErrorsMap.get(field) as FormError;
//       formErrorsMap.delete(field);
//       errors.current.set(field, error);
//       target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: error}}));
//     } else {
//       errors.current.delete(field);
//       target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: null}}));
//     }
//   }
//
//   for (const [field, error] of formErrorsMap.entries()) {
//     errors.current.set(field, error);
//     target.current.dispatchEvent(new CustomEvent(ERROR_EVENT, {detail: {name: field, error: error}}));
//   }
//
//   return [errored, formErrors];
// }, [getValues, validate]);
//

export function useForm<T>({validate}: UseFormParameters<T>): FormHook {
  const values = useRef<T>({} as T);
  const errors = useRef<ErrorObject>([]);
  const focusing = useRef<Path | null>(null);
  const target = useRef<EventTarget>(new EventTarget());
  const [submitting, setSubmitting] = useState(false);
  const path = useMemo(() => ROOT_PATH, []);

  const getValues = useRef(() => ({...values.current}));

  const getValue = useRef((path: Path) => getTreeValue(getValues.current(), path));

  const getError = useRef((path: Path): FormError | null => getTreeValue(errors.current, path));

  const change = useRef((path: Path, value: any) => {
    values.current = setTreeValue(values.current, path, value);
    target.current.dispatchEvent(new CustomEvent<ChangeEventDetail>(CHANGE_EVENT, {
      detail: {
        values: createChangesMap(path, value),
        errors: []
      }
    }));
  });

  const focus = useRef((path: Path) => {
    focusing.current = path;
    target.current.dispatchEvent(new CustomEvent<FocusBlurEventDetail>(FOCUS_EVENT, {
      detail: {
        path
      }
    }));
  });

  const blur = useRef((path: Path) => {
    if (focusing.current && pathEquals(path, focusing.current)) {
      focusing.current = null;

      target.current.dispatchEvent(new CustomEvent<FocusBlurEventDetail>(BLUR_EVENT, {
        detail: {
          path
        }
      }));
    }
  });

  const submit = useRef(() => {
    target.current.dispatchEvent(new CustomEvent(DO_SUBMIT_EVENT));
  });

  const getValidationResult = useRef(async (valuesObject?: T): Promise<[boolean, any]> => {
    if (!validate) return [false, []];

    let errored = false;
    const formErrors = await validate(valuesObject || getValues.current());
    errors.current = createErrorsMap([], formErrors);

    target.current.dispatchEvent(new CustomEvent<ChangeEventDetail>(CHANGE_EVENT, {
      detail: {
        values: [],
        errors: errors.current
      }
    }));

    return [errored, formErrors];
  });

  const root: RootForm = {
    submitting,
    target: target.current,
    getValues: getValues.current,
    getValue: getValue.current,
    getError: getError.current,
    change: change.current,
    focus: focus.current,
    blur: blur.current,
    submit: submit.current,
    setSubmitting,
    getValidationResult: getValidationResult.current
  };

  const io = useFormIO(root, path);

  return {
    type: FormHookType.OBJECT,
    path,
    root,
    ...io
  };
}
