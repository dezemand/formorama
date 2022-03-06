import { Form, useForm } from "formorama";
import { FC, useState } from "react";
import { Box } from "../src/components/atoms/box/Box";
import { Button } from "../src/components/atoms/button/Button";
import { Heading } from "../src/components/atoms/heading/Heading";
import { TextField } from "../src/components/fields/TextField";

export const SimpleExampleForm: FC = () => {
  const form = useForm();
  const [submission, setSubmission] = useState<any | null>(null);

  return (
    <Form form={form} onSubmit={setSubmission}>
      <Heading>A simple example</Heading>

      <Box>
        <TextField name="field1" placeholder="This field is called 'field1'" />
        <Button submit>Submit</Button>
      </Box>

      {submission && (
        <Box>
          <pre>{JSON.stringify(submission, null, 2)}</pre>
        </Box>
      )}
    </Form>
  );
};
