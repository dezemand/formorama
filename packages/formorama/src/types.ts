export type ArrayItem<T> = T extends Array<infer S> ? S : never;

export type NullableValues<T extends Record<any, any>> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? NullableValues<T[K]> | null : T[K] | null;
};

export type ErrorObject<T extends Record<any, any>> = {
  [K in keyof T]?: ErrorField<T[K]>;
} & {
  [key: string]: ErrorField<unknown>;
};

export type ErrorField<T> = T extends Record<string, any>
  ? ErrorObject<T> | string | null
  : T extends Array<infer S>
  ? ErrorField<S>[] | string[] | string | null
  : string | null;

export type ValidateFunction<Values> = (
  values: NullableValues<Values>
) => Promise<ErrorObject<Values>> | ErrorObject<Values>;

export type Validator<Values> = (values: NullableValues<Values>, errors: ErrorObject<Values>) => Promise<void> | void;
export type ValidatorWithArgs<Values, Extra extends any[]> = (
  values: NullableValues<Values>,
  errors: ErrorObject<Values>,
  ...extra: Extra
) => Promise<void> | void;
