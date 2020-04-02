export enum FormValueType {
  RAW,
  SUB_FORM,
  ARRAY_FORM
}

export interface IFormValue<T> {
  value: T;
  type: FormValueType;
}

export interface RawFormValue<T> extends IFormValue<T> {
  type: FormValueType.RAW;
}

export interface SubFormValue<T> extends IFormValue<ValuesMap<T>> {
  type: FormValueType.SUB_FORM;
}

export type FormValue<T> = RawFormValue<T> | SubFormValue<T>;

export type ValuesMap<T> = Map<keyof T, FormValue<T[keyof T]>>;
export type FormError = string | Error;
export type ErrorObject<T> = [keyof T, FormError | null][];
