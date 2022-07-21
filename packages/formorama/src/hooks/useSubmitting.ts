import { useCallback, useContext, useState } from "react";
import { FormContext, FormContextValue } from "../contexts/FormContext";
import { FormEventListener, SUBMITTING_EVENT } from "../events";
import { useEventEmitter } from "./useEventEmitter";
import { UseForm } from "./useForm";

export function useSubmitting(form?: UseForm): boolean {
  const context = useContext<FormContextValue>(FormContext);
  const formCtx = form ? form.ctx : context;
  const [submitting, setSubmitting] = useState(formCtx.controller.submitting);
  const submittingListener = useCallback<FormEventListener<typeof SUBMITTING_EVENT>>(
    (submitting) => setSubmitting(submitting),
    []
  );
  useEventEmitter(formCtx.controller, SUBMITTING_EVENT, submittingListener);
  return submitting;
}
