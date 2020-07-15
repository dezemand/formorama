import React, {FC, FormEvent, FormEventHandler, ReactNode, Ref, useCallback} from "react";
import {FormContext} from "../contexts/FormContext";
import {DO_SUBMIT_EVENT} from "../events";
import {useEventEmitter} from "../hooks/useEventEmitter";
import {FormHook} from "../hooks/useForm";
import {Path} from "../store/Path";

interface ErrorExtraResult<Values> {
  values: Values;
  event?: FormEvent<HTMLFormElement>;
}

interface SubmitExtraResult {
  event?: FormEvent<HTMLFormElement>;
}

export interface FormProps<Values> {
  form: FormHook<Values>;
  onSubmit?: (values: Values, extra: SubmitExtraResult) => Promise<void> | void;
  onError?: (errors: any, extra: ErrorExtraResult<Values>) => Promise<void> | void;
  noFormTag?: boolean;
  children?: ReactNode;
  formRef?: Ref<HTMLFormElement>;
}

export function Form<Values = any>({children, form, onSubmit, onError, noFormTag, formRef}: FormProps<Values>): ReturnType<FC<FormProps<Values>>> {
  const {ctx} = form;
  const {controller} = ctx;

  const submit = useCallback(async (event?: FormEvent<HTMLFormElement>) => {
    if (controller.submitting) {
      return;
    }

    controller.submitting = true;
    const valid = await controller.validate();

    if (valid && onSubmit) {
      await onSubmit(controller.getValue<Values>(Path.ROOT), {event});
    } else if (!valid && onError) {
      await onError(controller.getError(Path.ROOT), {
        values: controller.getValue<Values>(Path.ROOT),
        event
      });
    }

    controller.submitting = false;
  }, [onError, onSubmit, controller]);

  const formSubmit = useCallback<FormEventHandler<HTMLFormElement>>(async event => {
    event.preventDefault();
    await submit(event);
  }, [submit]);

  useEventEmitter(controller, DO_SUBMIT_EVENT, submit);

  return (
    <FormContext.Provider value={ctx}>
      {noFormTag ? (
        children
      ) : (
        <form onSubmit={formSubmit} ref={formRef}>
          {children}
        </form>
      )}
    </FormContext.Provider>
  );
}
