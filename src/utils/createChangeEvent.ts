import {ArrayFormValue, FormValue, FormValueType, RawFormValue, SubFormValue, UpdateMap} from "../types";
import {
  CHANGE_EVENT,
  CHANGE_MANY_EVENT,
  ChangeEventDetail,
  ChangeManyEventDetails,
  CustomChangeEvent,
  CustomChangeManyEvent
} from "../events";
import {createUpdateArrayMap, createUpdateObjectMap} from "./createUpdateMap";

function createChangeRawEvent<T>(name: string, formValue: RawFormValue<T>, form: string | null): CustomChangeEvent {
  return new CustomEvent<ChangeEventDetail>(CHANGE_EVENT, {
    detail: {
      name,
      value: formValue.value,
      form
    }
  });
}

function createChangeManyEvent<T>(fullName: string, formValue: SubFormValue<T> | ArrayFormValue<T>): CustomChangeManyEvent {
  const updates: UpdateMap = new Map();

  switch (formValue.type) {
    case FormValueType.OBJECT:
      createUpdateObjectMap(updates, formValue.value, fullName);
      break;
    case FormValueType.ARRAY:
      createUpdateArrayMap(updates, formValue.value, fullName);
      break;
  }

  return new CustomEvent<ChangeManyEventDetails>(CHANGE_MANY_EVENT, {detail: {updates}});
}

export function createChangeEvent<T>(name: string, formValue: FormValue<T>, form: string | null): CustomChangeEvent | CustomChangeManyEvent {
  switch (formValue.type) {
    case FormValueType.RAW:
      return createChangeRawEvent(name, formValue, form);
    case FormValueType.OBJECT:
    case FormValueType.ARRAY:
      return createChangeManyEvent(form ? `${form}.${name}` : name, formValue);
  }
}

export function createChangeEventForArray<T>(index: number, formValue: FormValue<T>, form: string): CustomChangeManyEvent {
  if (formValue.type === FormValueType.OBJECT) {
    return createChangeManyEvent(`${form}[${index}]`, formValue);
  } else {
    throw new Error("Could not make change event for <ArrayForm>: value not an object.");
  }
}
