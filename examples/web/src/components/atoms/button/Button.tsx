import { FC, HTMLAttributes } from "react";

interface ButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, "type"> {
  submit?: boolean;
}

export const Button: FC<ButtonProps> = ({ submit, ...props }) => {
  return <button type={submit ? "submit" : "button"} {...props} />;
};
