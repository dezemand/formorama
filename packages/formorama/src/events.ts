import { FormEvent } from "react";
import { Change } from "./store/Change";
import { FieldError } from "./validation/Validator";
import { Path } from "./store/Path";

export const CHANGE_EVENT = "change" as const;
export const ERROR_EVENT = "formerror" as const;
export const FOCUS_EVENT = "focus" as const;
export const BLUR_EVENT = "blur" as const;
export const DO_SUBMIT_EVENT = "dosubmit" as const;
export const SUBMITTING_EVENT = "submitting" as const;

export type FormoramaEvents = {
  [CHANGE_EVENT]: [changes: Change[]];
  [ERROR_EVENT]: [errors: FieldError[]];
  [FOCUS_EVENT]: [focusedPath: Path];
  [BLUR_EVENT]: [oldFocus: Path];
  [DO_SUBMIT_EVENT]: [event?: FormEvent<HTMLFormElement>];
  [SUBMITTING_EVENT]: [submitting: boolean];
};

export type FormEventListener<Event extends keyof Events, Events extends Record<string, any[]> = FormoramaEvents> = (
  ...args: Events[Event]
) => void;
