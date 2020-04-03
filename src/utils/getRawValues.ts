import {ArrayValuesMap, FormValue, FormValueType, ValuesMap} from "../types";

export function getRawValue<T>(formValue: FormValue<T>) {
  switch (formValue.type) {
    case FormValueType.RAW:
      return formValue.value;
    case FormValueType.OBJECT:
      return getRawValues(formValue.value);
    case FormValueType.ARRAY:
      return getRawArrayValues(formValue.value);
  }
}

export function getRawValues<T>(map: ValuesMap<T>): T {
  const object: T = {} as T;
  for (const [key, value] of map.entries()) object[key] = getRawValue(value);
  return object;
}

export function getRawArrayValues<T>(map: ArrayValuesMap<T[], T>): T {
  const arr = [];
  console.log("Getting raw array values", map);
  for (const [key, value] of map.entries()) {
    console.log(value);
    arr[key] = getRawValue(value);
  }
  return arr as unknown as T;
}
