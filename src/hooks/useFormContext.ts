import {useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormContextValue} from "../types";

export function useFormContext<T>(): FormContextValue<T>["form"] {
  return useContext(FormContext).form;
}
