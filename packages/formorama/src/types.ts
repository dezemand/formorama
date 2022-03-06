export type ArrayItem<T> = T extends Array<infer S> ? S : never;

export type NullableValues<T extends Record<any, any>> = {
  [K in keyof T]?: NullableField<T[K]>;
};

export type NullableField<T> = T extends Record<any, any> ? NullableValues<T> | null : T | null;

export type ErrorObject<T> = {
  [K in keyof T]?: ErrorField<T[K]>;
} & (
  | {
      [key: string]: ErrorField<unknown>;
    }
  | {}
);

export type ErrorField<T> = T extends Record<any, any> ? ErrorObject<T> | string | null : string | null;

export type ValidateFunction<Values> = (
  values: NullableValues<Values>
) => Promise<ErrorObject<Values>> | ErrorObject<Values>;

export type Validator<Values, Extra extends any[] = []> = (
  values: NullableValues<Values>,
  errors: ErrorObject<Values>,
  ...extra: Extra
) => Promise<void> | void;
