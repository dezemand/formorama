class _EventTarget implements EventTarget {
  private documentFragment = document.createDocumentFragment();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    this.documentFragment.addEventListener(type, listener, options);
  }

  dispatchEvent(event: Event): boolean {
    return this.documentFragment.dispatchEvent(event);
  }

  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
    this.documentFragment.removeEventListener(type, callback, options);
  }
}

export function createEventTarget(): EventTarget {
  try {
    return new EventTarget();
  } catch (e) {
    return new _EventTarget();
  }
}

export function createCustomEvent<T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T> {
  try {
    return new CustomEvent<T>(typeArg, eventInitDict);
  } catch (e) {
    const init: CustomEventInit<T> = eventInitDict || {bubbles: false, cancelable: false, detail: undefined};
    const event = document.createEvent("CustomEvent");
    event.initCustomEvent(typeArg, Boolean(init.bubbles), Boolean(init.cancelable), init.detail);
    return event;
  }
}
