import {Context, createContext} from "react";
import {FormContextValue, FormType} from "../types";

export const FormContext: Context<FormContextValue<any>> = createContext({type: FormType.INVALID} as FormContextValue<any>);

export const FormConsumer = FormContext.Consumer;
