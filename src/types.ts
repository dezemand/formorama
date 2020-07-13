import {ChangeEvent, FocusEvent} from "react";
import {PathNode} from "./store/Path";

export type Path = PathNode[];

export type FormError = string | Error;

export type ErrorObject = { path: Path, error: FormError | null }[];

export type UnparsedPathNode = PathNode | string | null | undefined;

export type UnparsedPath = PathNode[] | UnparsedPathNode[] | string | null | undefined;

export enum FormHookType {
  ARRAY,
  OBJECT
}

export interface RootFormFunctions<RootValues = any> {
  getValues(): RootValues;

  getValue<T>(path: UnparsedPath): T;

  getError(path: UnparsedPath): FormError | null;

  setErrors(errors: any): [boolean, any];

  isFocused(path: UnparsedPath): boolean;

  change<T>(path: UnparsedPath, value: T): void;

  focus(path: UnparsedPath): void;

  blur(path: UnparsedPath): void;

  submit(): void;

  getValidationResult(values?: RootValues): Promise<[boolean, any]>;
}

export interface RootForm<RootValues = any> extends RootFormFunctions<RootValues> {
  submitting: boolean;
  target: EventTarget;

  setSubmitting(submitting: boolean): void;
}

export interface FormIOHook<Values = any> {
  getValues(): Values;

  getValue(path: UnparsedPath): any;

  change<T>(path: UnparsedPath, value: T): void;

  modify(modifier: (input: Values) => Values): void;

  submit(): void;
}

export interface FormHook<Values = any, RootValues = any> extends FormIOHook<Values> {
  path: Path;

  root: RootForm<RootValues>;

  type: FormHookType;
}

export interface InputHook {
  value: any;
  error: FormError | null;
  submitting: boolean;
  focused: boolean;

  handleChange(event: ChangeEvent<HTMLElement> | any): void;

  handleFocus(event: FocusEvent): void;

  handleBlur(event: FocusEvent): void;
}
