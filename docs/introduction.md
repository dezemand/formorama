---
id: introduction
title: Introduction
sidebar_label: Introduction
---

> The documentation is still in the process of being written, please be patient 😅

## Why Formorama?
Formorama was created for a project that was using [Redux Form](https://redux-form.com/). After a long refactoring 
session and an update from the Redux Form author, it was decided that we needed to switch to a different forms library.
This library was created to tackle 2 main problems:

1. Making it as easy to store data in the form state as in a local state.
2. Dividing forms into smaller forms and lists should be easy and allow for readable code.

While existing libraries did a good job on tackling these problems already, we wanted a library that was a bit better
equiped for the job. This library is not meant to actively compete against existing form libraries, but to provide a 
different view on handling forms and to contribute in the Open Source ❤️ community.

### Easy field components
A field component is made by using the `useInput` hook in the component. The most basic it can do is provide the stored
value (`value`) and a function to change that value (`handleChange`). By doing this we allow practically anything to be
a form field.

#### Example using `react-dropzone`

```tsx
import React, {FC} from "react";
import {useInput} from "formorama";
import {useDropzone} from "react-dropzone";

interface DropzoneFieldProps {
  name: string;
}

const DropzoneField: FC<DropzoneFieldProps> = ({name}) => {
  const {value, handleChange} = useInput(name, []);
  const {getRootProps, getInputProps} = useDropzone({onDrop: handleChange});

  return (
    <div { ...getRootProps() }>
      <input { ...getInputProps() }/>
    </div>
  );
};
```

### Dividing forms in sub-forms
In the past, using Redux Form, we did this using names as a selector, for example `"array[2].obj.item"`. This required
the name to be passed through to each component. We solved this by creating `<SubForm />` and `<ArrayForm />` components.
The children inside components would not be required to have the full name accessible to them, making them agnostic and
universal.

#### Example

```tsx
import React, {FC} from "react"; 
import {ArrayForm, ArrayFormItems, useForm} from "formorama";
import {TextField} from "./TextField";

interface FormValues {
  field1: string;
  subForm: {
    field2: string;
  }
  arrayForm: {
    field3: string;
    subInArrayForm: {
      field4: string;
    }
  }[];
}

const MyForm: FC = () => {
  const form = useForm<FormValues>();

  return (
    <Form form={form}>
      <TextField name="field1"/>
  
      <SubForm name="subForm">
        <TextField name="field2"/>
      </SubForm>
    
      <ArrayForm name="arrayForm">
        <ArrayFormItems>
          {() => (
            <>
              <TextField name="field3"/>

              <SubForm name="subInArrayForm">
                <TextField name="field4"/>
              </SubForm>
            </>
          )}
        </ArrayFormItems>
      </ArrayForm>
    </Form>
  );
};
```
