import { useEffect } from 'react';

export type UseEventListenerHook = (target: EventTarget, event: string, listener: (event: Event) => void) => void;

export const useEventListener: UseEventListenerHook = (target, event, listener) => {
    useEffect(() => {
        target.addEventListener(event, listener);
        return () => {
            target.removeEventListener(event, listener)
        };
    }, [ target, event, listener ]);
};
