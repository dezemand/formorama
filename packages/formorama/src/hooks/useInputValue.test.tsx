import { act, fireEvent, render } from "@testing-library/react";
import { FC, useEffect } from "react";
import { ArrayForm, ArrayFormItem, Form, NullableValues } from "../index";
import { useForm } from "./useForm";
import { useInput } from "./useInput";
import { useInputValue } from "./useInputValue";

const ManagedTextInput: FC<{ name: string }> = ({ name }) => {
  const { value, handleChange, handleBlur, handleFocus } = useInput(name, "");
  return <input type="text" value={value} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />;
};

describe("useInputValue hook", () => {
  it("Can be used to display text from an input field", () => {
    const Component: FC = () => {
      const form = useForm();
      const [fieldValue] = useInputValue(["field"], form);

      return (
        <Form form={form}>
          <p>Value: &apos;{fieldValue}&apos;</p>
          <ManagedTextInput name="field" />
        </Form>
      );
    };

    const { container } = render(<Component />);

    expect(container.querySelector("p")!.textContent).toEqual("Value: ''");
    fireEvent.change(container.querySelector("input")!, { target: { value: "Something" } });
    expect(container.querySelector("p")!.textContent).toEqual("Value: 'Something'");
  });

  it("Can be used to show the content of an array", () => {
    const Component: FC = () => {
      const form = useForm<{ array: string[] }>();
      const [array] = useInputValue(["array"], form) as [string[]];

      const handleClick = () => {
        form.modify<{ array: string[] }>((values) => ({
          array: [...(values?.array ?? []), "foo"]
        }));
      };

      return (
        <Form form={form}>
          <p>Array: [{String(array || [])}]</p>
          <button onClick={handleClick}>Increase array</button>
        </Form>
      );
    };

    const { container } = render(<Component />);

    expect(container.querySelector("p")!.textContent).toEqual("Array: []");
    fireEvent.click(container.querySelector("button")!);
    expect(container.querySelector("p")!.textContent).toEqual("Array: [foo]");
    fireEvent.click(container.querySelector("button")!);
    fireEvent.click(container.querySelector("button")!);
    expect(container.querySelector("p")!.textContent).toEqual("Array: [foo,foo,foo]");
  });

  it("Works with changing array values in a useEffect (Buggy?)", async () => {
    let changeValue = () => {};

    const Component: FC = () => {
      const form = useForm<{ array: { name: string; field: string }[] }>();
      const [array] = useInputValue(["array"], form) as [{ name: string; field: string }[]];

      useEffect(() => {
        form.change(
          "array",
          Array(5)
            .fill(null)
            .map((_, i) => ({ name: `item ${i}`, field: `input ${i}` }))
        );
      }, [form, form.change]);

      changeValue = () => form.change("array[1].field", "something");

      return (
        <Form form={form}>
          <p>{JSON.stringify(array)}</p>
          <ul>
            {(array || []).map(({ name, field }) => (
              <li key={name}>
                {name}: {field}
              </li>
            ))}
          </ul>
          <ArrayForm name="array">
            {(array || []).map((_, index) => (
              <ArrayFormItem index={index} key={index}>
                <ManagedTextInput name="field" />
              </ArrayFormItem>
            ))}
          </ArrayForm>
        </Form>
      );
    };

    const { container } = render(<Component />);

    expect(container.querySelector("ul")!.childNodes.length).toBe(5);

    await act(async () => await new Promise((resolve) => setTimeout(resolve)));

    expect(container.querySelector("ul")!.childNodes.length).toBe(5);

    fireEvent.input(container.querySelectorAll("input")[0], { target: { value: "test" } });
    await act(async () => await new Promise((resolve) => setTimeout(resolve)));

    expect(container.querySelector("ul")!.childNodes[0].textContent).toBe("item 0: test");
    act(() => changeValue());

    expect(container.querySelector("ul")!.childNodes[1].textContent).toBe("item 1: something");
  });

  it("Receives new state properly when the form state is rapidly changing (BUG)", () => {
    type FormState = { items: { value: string }[] };
    let modifyForm: (
      modifier: (values: NullableValues<FormState> | null) => NullableValues<FormState> | null
    ) => void = () => void 0;

    const Component: FC = () => {
      const form = useForm<FormState>();
      const [items] = useInputValue<[FormState["items"]]>(["items"], form);
      modifyForm = (modifier) => form.modify<FormState>(modifier);

      return (
        <div>
          {items ? (
            <ul>
              {items.map((item) => (
                <li key={item.value}>{item.value}</li>
              ))}
            </ul>
          ) : (
            <p>No items have been initialized yet.</p>
          )}
        </div>
      );
    };

    const { container } = render(<Component />);

    expect(container.querySelector("ul")).toBeNull();

    // Add one item
    act(() => modifyForm((values) => ({ ...(values ?? {}), items: [...(values?.items ?? []), { value: "item1" }] })));

    expect(container.querySelector("ul")).toBeTruthy();
    expect(container.querySelector("ul")!.childNodes).toHaveLength(1);

    // Inefficiently add 9 more items in a loop
    act(() => {
      for (let i = 2; i <= 10; i++) {
        modifyForm((values) => ({ ...(values ?? {}), items: [...(values?.items ?? []), { value: `item${i}` }] }));
      }
    });

    expect(container.querySelector("ul")!.childNodes).toHaveLength(10);

    // Inefficiently remove some items in a loop
    act(() => {
      const toRemove = ["item1", "item4", "item6", "item7", "item10"];

      for (const removeItem of toRemove) {
        modifyForm((values) => ({
          ...(values ?? {}),
          items: [...(values?.items ?? [])].filter((item) => item?.value !== removeItem)
        }));
      }
    });

    expect(container.querySelector("ul")!.childNodes).toHaveLength(5);

    // Remove the rest one by one
    act(() => {
      for (let i = 0; i < 5; i++) {
        modifyForm((values) => ({
          ...(values ?? {}),
          items: [...(values?.items ?? [])].filter((_, index) => index !== 0)
        }));
      }
    });

    expect(container.querySelector("ul")!.childNodes).toHaveLength(0);
  });
});
