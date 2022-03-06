import { FC, InputHTMLAttributes } from "react";
import c from "classnames";
import s from "./TextInput.module.scss";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const TextInput: FC<TextInputProps> = ({ className, ...props }) => {
  return <input className={c(s.input, className)} {...props} />;
};
