import {ChangeEvent, FocusEvent} from "react";

export enum PathNodeType {
  OBJECT_KEY,
  ARRAY_INDEX
}

export type PathNode = [PathNodeType.OBJECT_KEY, string] | [PathNodeType.ARRAY_INDEX, number];
export type Path = PathNode[];
export type FormError = string | Error;
export type ErrorObject = { path: Path, error: FormError }[];

export enum FormHookType {
  ARRAY,
  OBJECT
}

export interface RootForm {
  submitting: boolean;
  target: EventTarget;

  getValues(): any;

  getValue(path: Path): any;

  getError(path: Path): FormError | null;

  change(path: Path, value: any): void;

  focus(path: Path): void;

  blur(path: Path): void;

  submit(): void;

  setSubmitting(submitting: boolean): void;

  getValidationResult(values?: any): Promise<[boolean, any]>;
}

export interface FormIOHook {
  getValues(): any;

  getValue(path: Path): any;

  change(path: Path, value: any): void;

  modify<T>(modifier: (input: T) => T): void;
}

export interface FormHook extends FormIOHook {
  path: Path;

  root: RootForm;

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
