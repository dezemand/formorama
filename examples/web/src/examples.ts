import { FC } from "react";
import { SimpleExampleForm } from "../1-simple/SimpleExampleForm";
import { ExampleArrayForm } from "../2-arrays/ExampleArrayForm";

export const examples: Record<string, { component: FC }> = {
  "1-simple": { component: SimpleExampleForm },
  "2-arrays": { component: ExampleArrayForm }
};
