import { useEffect } from "react";
import { EventEmitter } from "../utils/eventemitter";

type EmitterEventMap<T> = T extends EventEmitter<infer S> ? S : never;

export function useEventEmitter<Emitter extends EventEmitter<any>, Event extends keyof EmitterEventMap<Emitter>>(
  emitter: Emitter,
  event: Event,
  callback: (...args: EmitterEventMap<Emitter>[Event]) => void
): void {
  useEffect(() => {
    return emitter.on(event, callback);
  }, [emitter, event, callback]);
}
