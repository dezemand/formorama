import { createContext } from "react";
import { FormCtx } from "../hooks/useForm";

export const FormContext = createContext({} as FormCtx);

export const FormConsumer = FormContext.Consumer;
