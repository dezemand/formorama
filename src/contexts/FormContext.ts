import { createContext, Context } from 'react';

export interface FormContextValue {
    change(name: string, value: any): void;
    focus(name: string): void;
    blur(name: string): void;
    listener: EventTarget;
    getValue(name: string): any;
    getError(name: string): any;
    submitting: boolean;
    revalidate(fields: string[]): Promise<void>;
}

const defaultValue: FormContextValue = {
    change() {},
    focus() {},
    blur() {},
    listener: new EventTarget(),
    getValue() {},
    getError() {},
    submitting: false,
    async revalidate() {}
};

export const FormContext: Context<FormContextValue> = createContext(defaultValue);
