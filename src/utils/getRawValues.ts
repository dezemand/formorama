import {FormValue, FormValueType, ValuesMap} from "../types";

export function getRawValue<T>(formValue: FormValue<T>) {
  switch (formValue.type) {
    case FormValueType.RAW:
      return formValue.value;
    case FormValueType.SUB_FORM:
      return getRawValues(formValue.value);
  }
}

export function getRawValues<T>(map: ValuesMap<T>): T {
  const object: T = {} as T;
  for (const [key, value] of map.entries()) object[key] = getRawValue(value);
  return object;
}
