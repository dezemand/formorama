import { useCallback, useContext, useState } from 'react';
import { FormContext } from '../contexts/FormContext';
import { CHANGE_EVENT, ERROR_EVENT } from '../events';
import { useEventListener } from './useEventListener';

export interface UseInputResult {
    value: any;
    error: any;
    handleChange(event: Event): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    submitting: boolean;
}

export type UseInputHook = (name: string, defaultValue: any) => UseInputResult;

export const useInput: UseInputHook = (name, defaultValue) => {
    const { getValue, getError, change, focus, blur, listener, submitting } = useContext(FormContext);
    const [ value, setValue ] = useState(() => {
        let value = getValue(name);
        if(value === null) {
            value = defaultValue;
            change(name, defaultValue);
        }
        return value;
    });
    const [ error, setError ] = useState(() => getError(name));

    const changeEventHandler = useCallback(event => {
        if(event.detail.name === name) {
            setValue(event.detail.value);
        }
    }, [ name ]);
    const errorEventHandler = useCallback(event => {
        if(event.detail.name === name) {
            setError(event.detail.error);
        }
    }, [ name ]);

    useEventListener(listener, CHANGE_EVENT, changeEventHandler);
    useEventListener(listener, ERROR_EVENT, errorEventHandler);

    const handleChange = useCallback(event => {
        if(event.target) {
            change(name, event.target.value);
        } else {
            change(name, event);
        }
    }, [ change, name ]);

    const handleFocus = useCallback(() => {
        focus(name);
    }, [ focus, name ]);

    const handleBlur = useCallback(() => {
        blur(name);
    }, [ blur, name ]);

    return {
        value, error, handleChange, handleFocus, handleBlur, submitting
    };
};
