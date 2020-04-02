import {Context, createContext} from "react";
import {UseFormResult} from "../hooks/useForm";

interface FormContextValue<T> {
  form: UseFormResult<T>;
  name: string | null;
}

export const FormContext: Context<FormContextValue<any>> = createContext({} as FormContextValue<any>);
