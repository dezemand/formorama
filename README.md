<div style="text-align: center">
<h1>Formorama</h1>

<h3>Library for creating forms in React.</h3>

<br />

[**Read The Docs**](https://formorama.org/docs/introduction) (Temporally unavailable)

<br />
</div>

<hr />

[![Bundle Size][bundlephobia-badge]][bundlephobia]
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![PRs Welcome][prs-badge]][prs]
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]s

## What is Formorama?
Formorama is a library for managing your forms in React. This library was made when a project was moving away from Redux Forms. The reason I've decided to create this instead of using an existing library is because the project required subforms and many different types of input fields. For further information, visit the [website](https://formorama.org).

### Example
View this example on [CodeSandbox](https://codesandbox.io/s/formorama-simple-example-xsipc).

```typescript jsx
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

interface FormValues {
  field1: string;
  sub: {
    field2: string;
  }
}

export const MyForm: FC = () => {
  const form = useForm<FormValues>();
  const [result, setResult] = useState<FormValues | null>(null);

  const handleSubmit = (values: FormValues) => setResult(values);

  return (
    <>
      <Form form={form} onSubmit={handleSubmit}>
        <TextField name="field1" />
        <SubForm name="sub">
          <TextField name="field2" />
        </SubForm>
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

[npm]: https://www.npmjs.com/
[yarn]: https://classic.yarnpkg.com
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/github/workflow/status/dezemand/formorama/Tests%20Push?logo=github&style=flat-square
[build]: https://github.com/dezemand/formorama/actions?query=workflow%3A"Tests+Push"
[coverage-badge]: https://img.shields.io/codecov/c/github/dezemand/formorama.svg?style=flat-square
[coverage]: https://codecov.io/github/dezemand/formorama
[version-badge]: https://img.shields.io/npm/v/formorama.svg?style=flat-square
[package]: https://www.npmjs.com/package/formorama
[downloads-badge]: https://img.shields.io/npm/dm/formorama.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/formorama
[license-badge]: https://img.shields.io/npm/l/formorama.svg?style=flat-square
[license]: https://github.com/dezemand/formorama/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[bundlephobia-badge]: https://badgen.net/bundlephobia/minzip/formorama
[bundlephobia]: https://bundlephobia.com/result?p=formorama
[github-watch-badge]: https://img.shields.io/github/watchers/dezemand/formorama.svg?style=social
[github-watch]: https://github.com/dezemand/formorama/watchers
[github-star-badge]: https://img.shields.io/github/stars/dezemand/formorama.svg?style=social
[github-star]: https://github.com/dezemand/formorama/stargazers
[emojis]: https://github.com/all-contributors/all-contributors#emoji-key
[guiding-principle]: https://twitter.com/kentcdodds/status/977018512689455106
[bugs]: https://github.com/testing-library/react-testing-library/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Acreated-desc
[requests]: https://github.com/dezemand/formorama/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3Aenhancement+is%3Aopen
[good-first-issue]: https://github.com/dezemand/formorama/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"good+first+issue"+
