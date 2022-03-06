import { useInput } from "formorama";
import { FC, InputHTMLAttributes } from "react";
import { TextInput } from "../atoms/input/TextInput";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export const TextField: FC<TextFieldProps> = ({ name, ...props }) => {
  const { listeners, value } = useInput(name, "");

  return <TextInput {...props} {...listeners} value={value} />;
};
