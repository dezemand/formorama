import {act, fireEvent, render} from "@testing-library/react";
import React, {FC} from "react";
import {Form} from "..";
import {useForm} from "./useForm";
import {useInput} from "./useInput";

describe("useInput hook", () => {
  it("Does not throw on handleChange(null)", () => {
    const InputComponent: FC<{ name: string }> = ({name}) => {
      const {value, handleChange} = useInput<null | "not null">(name, null);

      const change = () => handleChange(value === null ? "not null" : null);

      return (
        <div>
          <p>Value is null: {value === null ? "Yes" : "No"}</p>
          <button type="button" onClick={change}>Change</button>
        </div>
      );
    };

    const Component: FC = () => {
      const form = useForm<{ test: null | "not null" }>();

      return (
        <Form form={form}>
          <InputComponent name="test"/>
        </Form>
      );
    };

    const {container} = render(<Component/>);

    expect(container.querySelector("p")!.textContent).toBe("Value is null: Yes");

    act(() => {
      fireEvent.click(container.querySelector("button")!);
    });

    expect(container.querySelector("p")!.textContent).toBe("Value is null: No");

    act(() => {
      fireEvent.click(container.querySelector("button")!);
    });

    expect(container.querySelector("p")!.textContent).toBe("Value is null: Yes");
  });

  it("Does not throw on handleChange(undefined)", () => {
    const InputComponent: FC<{ name: string }> = ({name}) => {
      const {value, handleChange} = useInput<undefined | "not undefined">(name, undefined);

      const change = () => handleChange(value === undefined ? "not undefined" : undefined);

      return (
        <div>
          <p>Value is undefined: {value === undefined ? "Yes" : "No"}</p>
          <button type="button" onClick={change}>Change</button>
        </div>
      );
    };

    const Component: FC = () => {
      const form = useForm<{ test: undefined | "not undefined" }>();

      return (
        <Form form={form}>
          <InputComponent name="test"/>
        </Form>
      );
    };

    const {container} = render(<Component/>);

    expect(container.querySelector("p")!.textContent).toBe("Value is undefined: Yes");

    act(() => {
      fireEvent.click(container.querySelector("button")!);
    });

    expect(container.querySelector("p")!.textContent).toBe("Value is undefined: No");

    act(() => {
      fireEvent.click(container.querySelector("button")!);
    });

    expect(container.querySelector("p")!.textContent).toBe("Value is undefined: Yes");
  });
});
