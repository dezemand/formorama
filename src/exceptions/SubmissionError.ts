import { ImmutableValuesTree } from "../store/ImmutableValuesTree";

export class SubmissionError implements Error {
  public readonly message = "An error occurred while during the form submission";
  public readonly name: string = "Form submission error";
  public readonly errors: ImmutableValuesTree;

  constructor(errors: any) {
    this.errors = new ImmutableValuesTree(errors);
  }
}
