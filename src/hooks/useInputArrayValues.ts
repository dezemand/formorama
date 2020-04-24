import {useContext} from "react";
import {FormContext} from "../contexts/FormContext";

export function useInputArrayValues(): any[] {
  const form = useContext(FormContext);

  return [];
}
