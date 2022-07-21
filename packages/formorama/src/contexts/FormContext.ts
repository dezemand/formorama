import { createContext } from "react";
import { FormController } from "../store/FormController";
import { Path } from "../store/Path";

export interface FormContextValue<RootValues = any> {
  controller: FormController<RootValues>;
  path: Path;
}

export const FormContext = createContext({} as FormContextValue);

export const FormConsumer = FormContext.Consumer;
