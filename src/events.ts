import {FormError, UpdateMap} from "./types";

export const CHANGE_EVENT = "change";
export const CHANGE_MANY_EVENT = "changemany";
export const FOCUS_EVENT = "focus";
export const BLUR_EVENT = "blur";
export const ERROR_EVENT = "error";
export const DO_SUBMIT_EVENT = "dosubmit";


export interface ChangeEventDetail {
  name: string;
  value: any;
  form: string | null;
}

export type CustomChangeEvent = CustomEvent<ChangeEventDetail>;

export interface FocusBlurEventDetail {
  name: string;
  form: string | null;
}

export type CustomFocusBlurEvent = CustomEvent<FocusBlurEventDetail>;

export interface ChangeManyEventDetails {
  updates: UpdateMap;
}

export type CustomChangeManyEvent = CustomEvent<ChangeManyEventDetails>;

export interface ErrorEventDetail {
  name: string;
  error: FormError | null;
  form: string | null;
}

export type CustomErrorEvent = CustomEvent<ErrorEventDetail>;
