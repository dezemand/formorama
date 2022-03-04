import { EventEmitter } from "events";
import { useEffect } from "react";

export function useEventEmitter(emitter: EventEmitter, event: string, callback: (...args: any[]) => void): void {
  useEffect(() => {
    emitter.on(event, callback);
    return () => {
      emitter.removeListener(event, callback);
    };
  }, [emitter, event, callback]);
}
