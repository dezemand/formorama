import {useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {FormHook} from "../types";

export function useFormContext(): FormHook {
  return useContext(FormContext);
}
