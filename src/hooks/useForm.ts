import {useMemo, useRef, useState} from "react";
import {BLUR_EVENT, CHANGE_EVENT, ChangeEventDetail, DO_SUBMIT_EVENT, FOCUS_EVENT, FocusBlurEventDetail, POST_CHANGE_EVENT} from "../events";
import {ErrorObject, FormHook, FormHookType, Path, RootForm, RootFormFunctions} from "../types";
import {addNullErrors, createChangesMap, createErrorsMap} from "../utils/changes";
import {getTreeValue, parsePath, pathEquals, ROOT_PATH, setTreeValue} from "../utils/path";
import {useFormIO} from "./useFormIO";

export interface UseFormParameters<Values> {
  validate?(values: Values): any | Promise<any>;
}

export function useForm<Values>({validate}: UseFormParameters<Values> = {}): FormHook<Values, Values> {
  const values = useRef<Values>({} as Values);
  const errors = useRef<ErrorObject>([]);
  const focusing = useRef<Path | null>(null);
  const target = useRef<EventTarget>(new EventTarget());
  const [submitting, setSubmitting] = useState(false);
  const path = useMemo(() => ROOT_PATH, []);

  const getValues = useRef<RootFormFunctions<Values>["getValues"]>(() => ({...values.current}));

  const setErrors = useRef<RootFormFunctions<Values>["setErrors"]>((errorObject) => {
    const errorMap = createErrorsMap([], errorObject);
    errors.current = addNullErrors(errorMap, errors.current);

    target.current.dispatchEvent(new CustomEvent<ChangeEventDetail>(CHANGE_EVENT, {
      detail: {
        values: [],
        errors: errors.current
      }
    }));

    return [errorMap.length > 0, errorObject];
  });

  const rootFunctions = useRef<RootFormFunctions<Values>>({
    getValues: getValues.current,
    setErrors: setErrors.current,

    getValue(uPath) {
      return getTreeValue(getValues.current(), parsePath(uPath));
    },

    getError(uPath) {
      return getTreeValue(errors.current, parsePath(uPath));
    },

    change(uPath, value) {
      const path = parsePath(uPath);
      values.current = setTreeValue(values.current, path, value);
      target.current.dispatchEvent(new CustomEvent<ChangeEventDetail>(CHANGE_EVENT, {
        detail: {
          values: createChangesMap(path, value),
          errors: []
        }
      }));
      window.setTimeout(() => {
        target.current.dispatchEvent(new CustomEvent<ChangeEventDetail>(POST_CHANGE_EVENT, {
          detail: {
            values: createChangesMap(path, value),
            errors: []
          }
        }));
      }, 0);
    },

    focus(uPath) {
      const path = parsePath(uPath);
      focusing.current = path;
      target.current.dispatchEvent(new CustomEvent<FocusBlurEventDetail>(FOCUS_EVENT, {
        detail: {
          path
        }
      }));
    },

    blur(uPath) {
      const path = parsePath(uPath);
      if (focusing.current && pathEquals(path, focusing.current)) {
        focusing.current = null;

        target.current.dispatchEvent(new CustomEvent<FocusBlurEventDetail>(BLUR_EVENT, {
          detail: {
            path
          }
        }));
      }
    },

    submit() {
      target.current.dispatchEvent(new CustomEvent(DO_SUBMIT_EVENT));
    },

    async getValidationResult(valuesObject) {
      if (!validate) return [false, []];
      return setErrors.current(await validate(valuesObject || getValues.current()));
    },

    isFocused(uPath) {
      return focusing.current !== null && pathEquals(parsePath(uPath), focusing.current);
    }
  });

  const root: RootForm<Values> = useMemo(() => ({
    submitting,
    setSubmitting,
    target: target.current,
    ...rootFunctions.current
  }), [submitting]);

  const io = useFormIO<Values>(root, path);

  return useMemo(() => ({
    type: FormHookType.OBJECT,
    path,
    root,
    ...io
  }), [io, path, root]);
}
