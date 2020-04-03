import {FormError, UpdateMap} from "./types";

export const CHANGE_EVENT = "CHANGE";
export const CHANGE_MANY_EVENT = "CHANGE_MANY";
export const FOCUS_EVENT = "FOCUS";
export const BLUR_EVENT = "BLUR";
export const ERROR_EVENT = "ERROR";
export const DO_SUBMIT_EVENT = "DO_SUBMIT";


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
