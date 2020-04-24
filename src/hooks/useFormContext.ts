import {useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormHook} from "../types";

export function useFormContext<Values = any, RootValues = any>(): FormHook<Values, RootValues> {
  return useContext<FormHook<Values, RootValues>>(FormContext);
}
