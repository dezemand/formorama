---
id: example-simple
title: Simple form
---

See this example live in action on [CodeSandbox](https://codesandbox.io/s/formorama-simple-example-xsipc).

## TextField.tsx
```tsx
interface TextFieldProps {
  name: string;
}

export const TextField: FC<TextFieldProps> = ({ name }) => {
  const { value, handleChange, handleFocus, handleBlur } = useInput(name, "");

  return (
    <div className="text-field">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
};
```

## ExampleForm.tsx
```tsx
interface FormValues {
  field1: string;
}

export const ExampleForm: FC = () => {
  const form = useForm<FormValues>();
  const [result, setResult] = useState<FormValues | null>(null);

  const handleSubmit = (values: FormValues) => setResult(values);

  return (
    <>
      <Form form={form} onSubmit={handleSubmit}>
        <TextField name="field1" />
        <button type="submit">Submit</button>
      </Form>

      {result && (
        <div>
          <h2>Last submission</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </>
  );
};
```
