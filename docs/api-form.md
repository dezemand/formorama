---
id: api-form
title: <Form />
---

The `<Form />` component is the main component used in creating forms.

## Example

```tsx
interface MyFormValues {
  myfield: string;
}

const MyForm: FC = () => {
  const form = useForm<MyFormValues>();
  const htmlForm = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (values: MyFormValues) => {
    await Api.submitForm(values);
    Toast.success("Form submitted successfully!");
  };

  const handleError = () => {
    Toast.error("Form validation failed!");
  };

  return (
    <Form form={form} onSubmit={handleSubmit} onError={handleError} formRef={htmlForm}>
      <MyInputField name="myfield"/>
      <button type="submit">Submit</button>
    </Form>
  );
};
```

## Props

### children
`children?: React.ReactNode`

### form
`form: FormHook<Values>`

### onSubmit
`onSubmit?: (values: Values, extra: SubmitExtraResult) => Promise<void> | void`

### onError
`onError?: (errors: any, extra: ErrorExtraResult<Values>) => Promise<void> | void`

### formRef
`formRef?: React.Ref<HTMLFormElement>`

### noFormTag
`noFormTag?: boolean`
