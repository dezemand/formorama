import {Context, createContext} from "react";
import {UseFormResult} from "../hooks/useForm";

export const FormContext: Context<UseFormResult<any>> = createContext({} as UseFormResult<any>);
