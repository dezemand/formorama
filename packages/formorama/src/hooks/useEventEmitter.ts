import { EventEmitter } from "events";
import { useEffect } from "react";
import { FormEventListener, FormoramaEvents } from "../events";

export function useEventEmitter<Event extends keyof Events, Events extends Record<string, any[]> = FormoramaEvents>(
  emitter: EventEmitter,
  event: Event,
  callback: FormEventListener<Event, Events>
): void {
  useEffect(() => {
    emitter.on(event as string, callback as any);
    return () => {
      emitter.removeListener(event as string, callback as any);
    };
  }, [emitter, event, callback]);
}
