import c from "classnames";
import { FC, HTMLAttributes } from "react";
import s from "./Heading.module.scss";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: Level;
}

export const Heading: FC<HeadingProps> = ({ level = 1, className, ...props }) => {
  const Component: `h${Level}` = `h${level}`;

  return <Component className={c(s.heading, className)} {...props} />;
};
