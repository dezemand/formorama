import React, {ReactNode, useCallback} from "react";
import {FormContext} from "../contexts/FormContext";
import {DO_SUBMIT_EVENT} from "../events";
import {useEventListener} from "../hooks/useEventListener";
import {ErrorObject, FormType, RootFormHook} from "../types";

export interface FormProps<T> {
  form: RootFormHook<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  onError?: (errors: ErrorObject<T>, values: T) => Promise<void> | void;
  noFormTag?: boolean;
  children?: ReactNode;
}

export function Form<T extends any>({children, form, onSubmit, onError, noFormTag}: FormProps<T>) {
  const {submitting, internal: {getValidationResult, setSubmitting}, getValues} = form;

  const submit = useCallback(async () => {
    if (submitting) return;

    setSubmitting(true);
    const values = getValues();
    const [errored, validateResult] = await getValidationResult();

    if (errored && onError) await onError(validateResult, values);
    if (!errored && onSubmit) await onSubmit(values);

    setSubmitting(false);
  }, [getValidationResult, getValues, onError, onSubmit, setSubmitting, submitting]);

  const formSubmit = useCallback(async event => {
    event.preventDefault();
    await submit();
  }, [submit]);

  useEventListener(form.listener, DO_SUBMIT_EVENT, submit);

  return (
    <FormContext.Provider value={{type: FormType.ROOT, name: null, form}}>
      {noFormTag ? (
        children
      ) : (
        <form onSubmit={formSubmit}>
          {children}
        </form>
      )}
    </FormContext.Provider>
  );
}
