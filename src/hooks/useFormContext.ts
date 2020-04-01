import {useContext} from "react";
import {FormContext} from "../contexts/FormContext";
import {UseFormResult} from "./useForm";

export function useFormContext<T>(): UseFormResult<T> {
  return useContext(FormContext);
}
