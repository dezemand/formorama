import { FormEvent, FormEventHandler, FormHTMLAttributes, ReactElement, ReactNode, Ref, useCallback } from "react";
import { FormContext } from "../contexts/FormContext";
import { DO_SUBMIT_EVENT, FormEventListener } from "../events";
import { SubmissionError } from "../exceptions/SubmissionError";
import { useEventEmitter } from "../hooks/useEventEmitter";
import { FormHook } from "../hooks/useForm";
import { FormErrors } from "../store/FormErrors";
import { Path } from "../store/Path";

// noinspection JSDeprecatedSymbols
const DONT_ALLOW_HTML_TAGS = typeof navigator !== "undefined" && navigator.product === "ReactNative";

interface ErrorExtraResult<Values> {
  values: Values;
  event?: FormEvent<HTMLFormElement>;
}

interface SubmitExtraResult {
  event?: FormEvent<HTMLFormElement>;
}

export interface FormTagProps extends FormHTMLAttributes<HTMLFormElement> {
  noFormTag?: false;
  formRef?: Ref<HTMLFormElement>;
}

export interface NoFormTagProps {
  noFormTag: true;
}

export type FormProps<Values> = {
  form: FormHook<Values>;
  onSubmit?: (values: Values, extra: SubmitExtraResult) => Promise<void> | void;
  onError?: (errors: any, extra: ErrorExtraResult<Values>) => Promise<void> | void;
  children?: ReactNode;
} & (FormTagProps | NoFormTagProps);

function getFormTag(
  formSubmit: FormEventHandler<HTMLFormElement>,
  children: ReactNode | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { noFormTag, formRef, ...props }: FormProps<any> & FormTagProps
): ReactElement {
  return (
    <form {...props} ref={formRef} onSubmit={formSubmit}>
      {children}
    </form>
  );
}

export function Form<Values = any>({ children, form, onSubmit, onError, ...props }: FormProps<Values>): ReactElement {
  const { ctx } = form;
  const { controller } = ctx;

  if (DONT_ALLOW_HTML_TAGS) {
    props.noFormTag = true;
  }

  const submit = useCallback<FormEventListener<typeof DO_SUBMIT_EVENT>>(
    async (event) => {
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
      {props.noFormTag ? children : getFormTag(formSubmit, children, props as FormProps<any> & FormTagProps)}
    </FormContext.Provider>
  );
}
