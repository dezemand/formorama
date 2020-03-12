import {Context, createContext} from "react";

export interface FormContextValue {
  listener: EventTarget;
  submitting: boolean;

  change(name: string, value: any): void;

  focus(name: string): void;

  blur(name: string): void;

  getValue(name: string): any;

  getError(name: string): any;

  revalidate(fields: string[]): Promise<void>;
}

const defaultValue: FormContextValue = {
  listener: new EventTarget(),
  submitting: false,

  change() {
  },
  focus() {
  },
  blur() {
  },
  getValue() {
  },
  getError() {
  },
  async revalidate() {
  }
};

export const FormContext: Context<FormContextValue> = createContext(defaultValue);
