import { FC } from "react";
import s from "./Main.module.scss";

interface MainProps {}

export const Main: FC<MainProps> = ({ children }) => {
  return <main className={s.container}>{children}</main>;
};
