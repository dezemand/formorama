import {ChangeEvent, FocusEvent} from "react";

export enum PathNodeType {
  OBJECT_KEY,
  ARRAY_INDEX
}

export type PathNode = [PathNodeType.OBJECT_KEY, string] | [PathNodeType.ARRAY_INDEX, number];

export type Path = PathNode[];

export type FormError = string | Error;

export type ErrorObject = { path: Path, error: FormError }[];

export type UnparsedPathNode = PathNode | string | null | undefined;

export type UnparsedPath = PathNode[] | UnparsedPathNode[] | string | null | undefined;

export enum FormHookType {
  ARRAY,
  OBJECT
}

export interface RootForm<RootValues = any> {
  submitting: boolean;
  target: EventTarget;

  getValues(): RootValues;

  getValue<T>(path: Path): T;

  getError(path: Path): FormError | null;

  change<T>(path: Path, value: T): void;

  focus(path: Path): void;

  blur(path: Path): void;

  submit(): void;

  setSubmitting(submitting: boolean): void;

  getValidationResult(values?: RootValues): Promise<[boolean, any]>;
}

export interface FormIOHook<Values = any> {
  getValues(): Values;

  getValue(path: Path): any;

  change<T>(path: Path, value: T): void;

  modify(modifier: (input: Values) => Values): void;
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

  handleChange(event: ChangeEvent<HTMLElement> | any): void;

  handleFocus(event: FocusEvent): void;

  handleBlur(event: FocusEvent): void;
}
