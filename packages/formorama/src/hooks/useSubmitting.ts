import { useCallback, useContext, useState } from "react";
import { FormContext } from "../contexts/FormContext";
import { FormEventListener, SUBMITTING_EVENT } from "../events";
import { useEventEmitter } from "./useEventEmitter";
import { FormCtx, FormHook } from "./useForm";

export function useSubmitting(form?: FormHook): boolean {
  const context = useContext<FormCtx>(FormContext);
  const formCtx = form ? form.ctx : context;
  const [submitting, setSubmitting] = useState(formCtx.controller.submitting);
  const submittingListener = useCallback<FormEventListener<typeof SUBMITTING_EVENT>>(
    (submitting) => setSubmitting(submitting),
    []
  );
  useEventEmitter(formCtx.controller, SUBMITTING_EVENT, submittingListener);
  return submitting;
}
