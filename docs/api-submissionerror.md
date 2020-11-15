---
id: api-submissionerror
title: SubmissionError
---

The `SubmissionError` extends the `Error` class and is used to add errors to certain fields on submission.

## Example

```tsx
const Form: FC = () => {
  const form = useForm<FormValues>();
  
  const handleSubmit = async (values: FormValues) => {
    const result = await Api.submitForm(values);
    if(result.error) {
      throw new SubmissionError({field: "This field has an error"});
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      ... your form here ...
    </Form>
  ); 
}
```

## Reference

#### `new SubmissionError(errors: FieldErrorObject)`

This creates an instance. The `FieldErrorObject` should be an object containing the errors for each field (same as the validation result).

