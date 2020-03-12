import {useContext} from "react";
import {FormContext, FormContextValue} from "../contexts/FormContext";

export function useFormContext(): FormContextValue {
  return useContext(FormContext);
}
