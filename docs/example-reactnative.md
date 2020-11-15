---
id: example-reactnative
title: React Native Form
---

## TextField.tsx
```tsx
interface TextFieldProps {
  name: string;
}

export const TextField: FC<TextFieldProps> = ({ name }) => {
  const { value, handleChange, handleFocus, handleBlur } = useInput(name, "");

  return (
    <View>
      <TextInput
        type="text"
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </View>
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
        <Button title="Submit" onPress={form.submit} />
      </Form>

      {result && (
        <View>
          <Text>Last submission</Text>
          <Text>{JSON.stringify(result, null, 2)}</Text>
        </View>
      )}
    </>
  );
};
```
