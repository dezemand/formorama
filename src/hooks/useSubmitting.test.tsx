import {act, fireEvent, render} from "@testing-library/react";
import React, {FC} from "react";
import {Form, useSubmitting} from "..";
import {useForm} from "./useForm";

describe("useSubmitting hook", () => {
  it("Updates the component with the correct submitting state", async () => {
    let resolve: () => void = () => void 0;
    const Component: FC = () => {
      const form = useForm();
      const submitting = useSubmitting(form);

      const handleSubmit = async () => {
        await (new Promise(r => {
          resolve = r;
        }));
      };

      return (
        <Form form={form} onSubmit={handleSubmit}>
          <button type="submit" disabled={submitting}>Submit</button>
        </Form>
      );
    };

    const {container} = render(<Component/>);

    expect(container.querySelector("button")!.disabled).toBeFalsy();

    fireEvent.click(container.querySelector("button")!);
    await act(async () => await (new Promise(resolve => setTimeout(resolve))));

    expect(container.querySelector("button")!.disabled).toBeTruthy();

    resolve();
    await act(async () => await (new Promise(resolve => setTimeout(resolve))));

    expect(container.querySelector("button")!.disabled).toBeFalsy();
  });
});
