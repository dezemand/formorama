export type BaseEventMap = Record<string, any[]>;

export class EventEmitter<EventMap extends BaseEventMap> {
  private readonly listeners: Map<keyof EventMap, ((...args: any[]) => void)[]> = new Map();

  removeListener<Event extends keyof EventMap>(event: Event, listener: (...args: EventMap[Event]) => void): void {
    const prevListeners = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      prevListeners.filter((item) => item !== listener)
    );
  }

  on<Event extends keyof EventMap>(event: Event, listener: (...args: EventMap[Event]) => void): () => void {
    const prevListeners = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...(prevListeners as any[]), listener]);
    return () => this.removeListener(event, listener);
  }

  emit<Event extends keyof EventMap>(event: Event, ...args: EventMap[Event]): void {
    const listeners = this.listeners.get(event) ?? [];
    listeners.forEach((listener) => listener(args));
  }
}
