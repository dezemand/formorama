import {useCallback, useContext, useState} from "react";
import {FormContext} from "../contexts/FormContext";
import {useEventListener} from "./useEventListener";
import {CHANGE_EVENT} from "../events";

export function useInputValue<T>(fields: (keyof T)[]): any[] {
    const {getValue, listener} = useContext(FormContext);
    const [values, setValues] = useState<any[]>(() => fields.map(field => getValue(field)));

    const handleChange = useCallback((event: CustomEvent) => {
        const valueIndex = fields.indexOf(event.detail.name);
        if (valueIndex !== -1) {
            const newValues = [...values];
            newValues[valueIndex] = event.detail.value;
            setValues(newValues);
        }
    }, [fields, values]);

    useEventListener(listener, CHANGE_EVENT, handleChange as EventListener);

    return values;
}
