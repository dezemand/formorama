export enum FormType {
  INVALID,
  ROOT,
  OBJECT,
  ARRAY
}

export enum FormValueType {
  RAW,
  OBJECT,
  ARRAY
}

export interface IFormValue<T> {
  value: T;
  type: FormValueType;
}

export interface RawFormValue<T> extends IFormValue<T> {
  type: FormValueType.RAW;
}

export interface SubFormValue<T> extends IFormValue<ValuesMap<T>> {
  type: FormValueType.OBJECT;
}

export interface ArrayFormValue<T> extends IFormValue<ArrayValuesMap<T[], T>> {
  type: FormValueType.ARRAY;
}

export type FormValue<T> = RawFormValue<T> | SubFormValue<T> | ArrayFormValue<T>;

export type ValuesMap<T> = Map<keyof T, FormValue<T[keyof T]>>;
export type ArrayValuesMap<T extends S[], S> = Map<number, FormValue<T[0]>>;
export type FormError = string | Error;
export type ErrorObject<T> = [keyof T, FormError | null][];

interface FormHookInternal<T> {
  name: string | null;

  setSubmitting(submitting: boolean): void;
}

interface FormHook<T> {
  listener: EventTarget;
  submitting: boolean;
  internal: FormHookInternal<T>;

  getValues(): T;

  submit(): void;
}

export interface ObjectFormHookInternal<T> extends FormHookInternal<T> {
  setSubValues(name: keyof T, value: FormValue<any>): void;
}

export interface ObjectFormHook<T> extends FormHook<T> {
  internal: ObjectFormHookInternal<T>;

  change<K extends keyof T>(name: K, value: T[K]): void;

  focus(name: string): void;

  blur(name: string): void;

  getValue<K extends keyof T>(name: K): T[K] | null;

  getError<K extends keyof T>(name: K): FormError | null;
}

export interface ArrayFormHookInternal<T> extends FormHookInternal<T> {
  focus(name: string): void;

  blur(name: string): void;

  setItemValues(index: number, values: any): void;
}

export interface ArrayFormHook<T extends T[]> extends FormHook<T> {
  internal: ArrayFormHookInternal<T>;

  getValue(index: number): T[0] | null;
}

export interface RootFormHookInternal<T> extends ObjectFormHookInternal<T> {
  getValidationResult(values?: T): Promise<[boolean, ErrorObject<T>]>;
}

export interface RootFormHook<T> extends ObjectFormHook<T> {
  internal: RootFormHookInternal<T>;
}

interface IFormContextValue<T> {
  form: T;
  name: string | null;
  type: FormType;
}

export interface InvalidFormContextValue extends IFormContextValue<null> {
  type: FormType.INVALID;
}

export interface RootFormContextValue<T> extends IFormContextValue<RootFormHook<T>> {
  type: FormType.ROOT;
  name: null;
}

export interface SubFormContextValue<T> extends IFormContextValue<ObjectFormHook<T>> {
  type: FormType.OBJECT;
  name: string;
}

export interface ArrayFormContextValue<T> extends IFormContextValue<ArrayFormHook<any>> {
  type: FormType.ARRAY;
  name: string;
}

export type FormContextValue<T> =
  InvalidFormContextValue
  | RootFormContextValue<T>
  | SubFormContextValue<T>
  | ArrayFormContextValue<T>;
