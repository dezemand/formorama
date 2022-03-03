import { act, fireEvent, render } from "@testing-library/react";
import { FC } from "react";
import { SubmissionError, useForm, useInput } from "..";
import { Form } from "./Form";

describe("Form component", () => {
  it("Renders a <form> element", () => {
    const Component: FC = () => {
      const form = useForm();
      return <Form form={form} />;
    };

    const { container } = render(<Component />);

    expect(container.querySelector("form")).not.toBeNull();
  });

  it("Does not render a <form> element when noFormTag is provided", () => {
    const Component: FC = () => {
      const form = useForm();
      return <Form form={form} noFormTag />;
    };

    const { container } = render(<Component />);

    expect(container.querySelector("form")).toBeNull();
  });

  it("Calls the submit handler on a submit event", async () => {
    const submitHandler = jest.fn();
    const Component: FC = () => {
      const form = useForm();

      return (
        <Form form={form} onSubmit={submitHandler}>
          <button type="submit">Submit</button>
        </Form>
      );
    };

    const { container } = render(<Component />);

    expect(submitHandler).not.toBeCalled();

    fireEvent.click(container.querySelector("button")!);
    await new Promise((resolve) => setTimeout(resolve));

    expect(submitHandler).toBeCalledTimes(1);
  });

  it("Calls the submit event handler when the submit function is called", async () => {
    const submitHandler = jest.fn();
    const Component: FC = () => {
      const form = useForm();

      return (
        <Form form={form} onSubmit={submitHandler}>
          <button type="button" onClick={form.submit}>
            Submit
          </button>
        </Form>
      );
    };

    const { container } = render(<Component />);

    fireEvent.click(container.querySelector("button")!);
    await new Promise((resolve) => setTimeout(resolve));

    expect(submitHandler).toBeCalledTimes(1);
  });

  it("Sets errors on a SubmissionError", async () => {
    const FormError: FC<{ name: string }> = ({ name }) => {
      const { errors } = useInput(name, "");
      return <p>{errors.length === 0 ? "No errors" : `Errors: [${errors}]`}</p>;
    };

    const Component: FC = () => {
      const form = useForm();

      const handleSubmit = async () => {
        throw new SubmissionError({ a: "error" });
      };

      return (
        <Form form={form} onSubmit={handleSubmit}>
          <FormError name="a" />
          <button type="submit">Submit</button>
        </Form>
      );
    };

    const { container } = render(<Component />);

    expect(container.querySelector("p")!.textContent).toBe("No errors");

    fireEvent.click(container.querySelector("button")!);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve));
    });

    expect(container.querySelector("p")!.textContent).toBe("Errors: [error]");
  });

  it.skip("Throws errors in the submit handler that are not SubmissionError instances", async () => {
    const Component: FC = () => {
      const form = useForm();

      const handleSubmit = async () => {
        throw new Error("Something uncaught happened!");
      };

      return (
        <Form form={form} onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>
      );
    };

    const { container } = render(<Component />);

    fireEvent.click(container.querySelector("button")!);

    await act(async () => await new Promise((resolve) => setTimeout(resolve)));

    // Cannot expect
  });

  describe("Validation on submission", () => {
    let errorHandler: jest.Mock;
    let submitHandler: jest.Mock;

    interface FormValues {
      a: string;
    }

    const validate = ({ a }: FormValues): any => ({
      a: a === "bad" ? "error" : undefined
    });

    const ManagedTextInput: FC<{ name: string }> = ({ name }) => {
      const { value, handleChange, handleBlur, handleFocus, error } = useInput(name, "");
      return (
        <div>
          {error && <div className="form-error">Error: '{error}'</div>}
          <input type="text" value={value} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
        </div>
      );
    };

    const TestForm: FC = () => {
      const form = useForm<FormValues>({ validate });

      return (
        <Form form={form} onSubmit={submitHandler} onError={errorHandler}>
          <ManagedTextInput name="a" />
          <button type="submit">Submit</button>
        </Form>
      );
    };

    beforeEach(() => {
      errorHandler = jest.fn();
      submitHandler = jest.fn();
    });

    it("Does not error on submission without input", async () => {
      const { container } = render(<TestForm />);

      fireEvent.click(container.querySelector("button")!);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve));
      });

      expect(container.querySelector("div.form-error")).toBeNull();
      expect(submitHandler).toBeCalledTimes(1);
      expect(errorHandler).not.toBeCalled();
    });

    it("Errors on a bad input", async () => {
      const { container } = render(<TestForm />);

      fireEvent.input(container.querySelector("input")!, { target: { value: "bad" } });
      fireEvent.click(container.querySelector("button")!);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve));
      });

      expect(container.querySelector("div.form-error")).not.toBeNull();
      expect(container.querySelector("div.form-error")!.textContent).toBe("Error: 'error'");
      expect(submitHandler).not.toBeCalled();
      expect(errorHandler).toBeCalledTimes(1);
    });

    it("Does not error on a good input", async () => {
      const { container } = render(<TestForm />);

      fireEvent.input(container.querySelector("input")!, { target: { value: "good" } });
      fireEvent.click(container.querySelector("button")!);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve));
      });

      expect(container.querySelector("div.form-error")).toBeNull();
      expect(submitHandler).toBeCalledTimes(1);
      expect(errorHandler).not.toBeCalled();
    });
  });
});
