import {ArrayValuesMap, FormValue, FormValueType, ValuesMap} from "../types";

export function createValueArrayMap<T extends T[]>(values: T): ArrayValuesMap<T, T[]> {
  const map: ArrayValuesMap<T, T[]> = new Map();

  values.forEach((value, index) => {
    map.set(index, {type: FormValueType.OBJECT, value: createValuesMap(value)});
  });

  return map;
}

export function createValuesMap<T>(values: T): ValuesMap<T> {
  const map: ValuesMap<T> = new Map();

  for (const [key, value] of Object.entries(values)) {
    map.set(key as keyof T, createFormValue(value));
  }

  return map;
}

export function createFormValue<T>(value: T): FormValue<T> {
  if (Array.isArray(value)) {
    return {type: FormValueType.ARRAY, value: createValueArrayMap(value)};
  } else if (typeof value === "object" && value !== null) {
    return {type: FormValueType.OBJECT, value: createValuesMap(value)};
  } else {
    return {type: FormValueType.RAW, value};
  }
}
