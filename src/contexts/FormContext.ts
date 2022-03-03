import { Context, createContext } from "react";
import { FormCtx } from "../hooks/useForm";

export const FormContext: Context<FormCtx> = createContext({} as FormCtx);

export const FormConsumer = FormContext.Consumer;
