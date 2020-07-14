import React, {ReactNode, useCallback} from "react";
import {FormContext} from "../contexts/FormContext";
import {DO_SUBMIT_EVENT} from "../events";
import {useEventEmitter} from "../hooks/useEventEmitter";
import {FormHook} from "../hooks/useForm";
import {Path} from "../store/Path";

export interface FormProps<Values> {
  form: FormHook<Values>;
  onSubmit?: (values: Values) => Promise<void> | void;
  onError?: (errors: any, values: Values) => Promise<void> | void;
  noFormTag?: boolean;
  children?: ReactNode;
}

export function Form<Values = any>({children, form, onSubmit, onError, noFormTag}: FormProps<Values>) {
  const {ctx} = form;
  const {controller} = ctx;

  const submit = useCallback(async () => {
    if (controller.submitting) return;

    controller.submitting = true;
    const valid = await controller.validate();

    if (!valid && onError) {
      await onError(controller.getError(Path.ROOT), controller.getValue<Values>(Path.ROOT));
    }

    if (valid && onSubmit) {
      await onSubmit(controller.getValue<Values>(Path.ROOT));
    }

    controller.submitting = false;
  }, [onError, onSubmit]);

  const formSubmit = useCallback(async event => {
    event.preventDefault();
    await submit();
  }, [submit]);

  useEventEmitter(controller, DO_SUBMIT_EVENT, submit);

  return (
    <FormContext.Provider value={ctx}>
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
