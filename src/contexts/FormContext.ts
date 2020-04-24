import {Context, createContext} from "react";
import {FormHook} from "../types";

const defaultValue = new Proxy({}, {
  get(): any {
    throw new Error("No FormContext found");
  }
});

export const FormContext: Context<FormHook> = createContext(defaultValue as FormHook);

export const FormConsumer = FormContext.Consumer;
