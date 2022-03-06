import { FC } from "react";
import s from "./Box.module.scss";

interface BoxProps {}

export const Box: FC<BoxProps> = ({ children }) => {
  return <div className={s.container}>{children}</div>;
};
