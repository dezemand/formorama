import {ErrorObject, Path} from "./types";

export const CHANGE_EVENT = "CHANGE";
export const FOCUS_EVENT = "FOCUS";
export const BLUR_EVENT = "BLUR";
export const DO_SUBMIT_EVENT = "DO_SUBMIT";
export const POST_CHANGE_EVENT = "POST_CHANGE_EVENT";

export interface ChangeEventDetail {
  values: { path: Path, value: any }[];
  errors: ErrorObject;
}

export type CustomChangeEvent = CustomEvent<ChangeEventDetail>;

export interface FocusBlurEventDetail {
  path: Path;
}

export type CustomFocusBlurEvent = CustomEvent<FocusBlurEventDetail>;
