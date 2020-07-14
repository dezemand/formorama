import React, {ComponentClass, FC, FunctionComponent, ReactNode} from "react";

export interface ArrayFormItemsChildrenParams<Values> {
  values: Values;
  index: number;

  remove(): void;
}

interface ArrayFormItemsProps<ParentValues extends Array<ParentValues>> {
  component?: FunctionComponent<ArrayFormItemsChildrenParams<ParentValues[0]>> | ComponentClass<ArrayFormItemsChildrenParams<ParentValues[0]>> | string;

  children?(options: ArrayFormItemsChildrenParams<ParentValues[0]>): ReactNode;

  getKey?(values: ParentValues[0], index: number): any;
}

export function ArrayFormItems<ParentValues extends Array<ParentValues> = any[], RootValues = any>({children, component, getKey}: ArrayFormItemsProps<ParentValues>): ReturnType<FC<ArrayFormItemsProps<ParentValues>>> {
  throw new Error("Not implemented");
}
