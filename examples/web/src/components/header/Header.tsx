import { FC } from "react";
import { Heading } from "../atoms/heading/Heading";
import s from "./Header.module.scss";

interface HeaderProps {}

export const Header: FC<HeaderProps> = () => {
  return (
    <header className={s.container}>
      <Heading>Formorama</Heading>
    </header>
  );
};
