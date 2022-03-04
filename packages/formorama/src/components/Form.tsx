import { FC, FormEvent, FormEventHandler, ReactNode, Ref, useCallback } from "react";
import { FormContext } from "../contexts/FormContext";
import { DO_SUBMIT_EVENT } from "../events";
import { SubmissionError } from "../exceptions/SubmissionError";
import { useEventEmitter } from "../hooks/useEventEmitter";
import { FormHook } from "../hooks/useForm";
import { FormErrors } from "../store/FormErrors";
import { Path } from "../store/Path";

const DONT_ALLOW_HTML_TAGS = typeof document === "undefined";

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

export function Form<Values = any>({
  children,
  form,
  onSubmit,
  onError,
  noFormTag = DONT_ALLOW_HTML_TAGS,
  formRef
}: FormProps<Values>): ReturnType<FC<FormProps<Values>>> {
  const { ctx } = form;
  const { controller } = ctx;

  const submit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      if (controller.submitting) {
        return;
      }

      controller.submitting = true;
      const valid = await controller.validateSubmission();

      if (valid && onSubmit) {
        try {
          await onSubmit(controller.getValue<Values>(Path.ROOT), { event });
          controller.errors = FormErrors.EMPTY;
        } catch (e) {
          if (e instanceof SubmissionError) {
            controller.errors = new FormErrors(e.errors.entries().map(([path, error]) => [path, [error]]));
          } else {
            throw e;
          }
        }
      } else if (!valid && onError) {
        await onError(controller.getErrors(Path.ROOT), {
          values: controller.getValue<Values>(Path.ROOT),
          event
        });
      }

      controller.submitting = false;
    },
    [onError, onSubmit, controller]
  );

  const formSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      await submit(event);
    },
    [submit]
  );

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
