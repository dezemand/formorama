import { ComponentClass, FC, ReactElement, ReactNode } from "react";
import { useFormContext } from "../hooks/useFormContext";
import { useInputValue } from "../hooks/useInputValue";
import { Path } from "../store/Path";
import { ArrayItem, NullableField } from "../types";
import { ArrayFormItem } from "./ArrayFormItem";

export interface ArrayFormItemsChildrenParams<Values> {
  values: Values;
  index: number;

  remove(): void;
}

type Component<Props> = FC<Props> | ComponentClass<Props> | string;
type ArrayFormItemsRenderOptions<Values> =
  | {
      component?: Component<ArrayFormItemsChildrenParams<Values>>;
    }
  | {
      children?(props: ArrayFormItemsChildrenParams<Values>): ReactNode;
    }
  | {
      renderItem?(props: ArrayFormItemsChildrenParams<Values>): ReactNode;
    };

interface ArrayFormItemsProps<ParentValues extends unknown[]> {
  keyExtractor?(values: ArrayItem<ParentValues>, index: number): any;

  getKey?(values: ArrayItem<ParentValues>, index: number): any;
}

function defaultGetKey(_: unknown, index: number): any {
  return `ArrayFormItems(${index})`;
}

function getItemElement<Values>(
  options: ArrayFormItemsRenderOptions<Values>,
  values: Values,
  index: number,
  remove: () => void
): ReactNode | null {
  if ("component" in options && options.component) {
    const Component = options.component;
    return <Component index={index} values={values} remove={remove} />;
  }

  if ("children" in options && options.children) {
    return options.children({ index, values, remove });
  }

  if ("renderItem" in options && options.renderItem) {
    return options.renderItem({ index, values, remove });
  }

  return null;
}

export function ArrayFormItems<ParentValues extends any[] = any[], RootValues = any>({
  getKey,
  keyExtractor: _keyExtractor,
  ...props
}: ArrayFormItemsProps<ParentValues> & ArrayFormItemsRenderOptions<ArrayItem<ParentValues>>): ReactElement {
  const form = useFormContext<RootValues>();
  const [_items] = useInputValue<[ParentValues]>([Path.ROOT]);
  const keyExtractor = _keyExtractor ?? getKey ?? defaultGetKey;
  const items = (_items ?? []) as ParentValues;

  const removeItem = (key: any) => {
    return () => {
      form.modify<ParentValues>(
        (arr) =>
          ((arr || []) as ParentValues).filter(
            (values, index) => keyExtractor(values, index) !== key
          ) as NullableField<ParentValues>
      );
    };
  };

  return (
    <>
      {(items || []).map((values, index) => {
        const key = keyExtractor(values, index);
        return (
          <ArrayFormItem index={index} key={key}>
            {getItemElement(props, values, index, removeItem(key))}
          </ArrayFormItem>
        );
      })}
    </>
  );
}
