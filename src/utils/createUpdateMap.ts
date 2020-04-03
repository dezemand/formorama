import {ArrayValuesMap, FormValueType, UpdateMap, ValuesMap} from "../types";

function createUpdateObjectMap<T>(updates: UpdateMap, values: ValuesMap<T>, name: string): void {
  for (const [key, value] of values.entries()) {
    switch (value.type) {
      case FormValueType.RAW:
        if (!updates.has(name)) updates.set(name, new Map());
        (updates.get(name) as Map<string, any>).set(key as string, value.value);
        break;
      case FormValueType.OBJECT:
        createUpdateObjectMap(updates, value.value as any, `${name}.${key}`);
        break;
      case FormValueType.ARRAY:
        createUpdateArrayMap(updates, value.value as any, `${name}.${key}`);
        break;
    }
  }
}

function createUpdateArrayMap<T>(updates: UpdateMap, values: ArrayValuesMap<T[], T>, name: string): void {
  for (const [index, value] of values.entries()) {
    if (value.type !== FormValueType.OBJECT) throw new Error("Value inside array must be an object.");
    createUpdateObjectMap(updates, value.value as any, `${name}[${index}]`);
  }
}

export function createUpdateMap<T>(values: ValuesMap<T>): UpdateMap {
  const updates: Map<string | null, Map<string, any>> = new Map();

  for (const [key, value] of values.entries()) {
    switch (value.type) {
      case FormValueType.RAW:
        if (!updates.has(null)) updates.set(null, new Map());
        (updates.get(null) as Map<string, any>).set(key as string, value.value);
        break;
      case FormValueType.OBJECT:
        createUpdateObjectMap(updates, value.value, key as string);
        break;
      case FormValueType.ARRAY:
        createUpdateArrayMap(updates, value.value, key as string);
        break;
    }
  }

  return updates;
}
