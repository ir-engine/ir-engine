export class MockEventListener {
  listeners: ((this: any, ev?: any) => any)[] = []

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    this.listeners.push(listener)
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) {
    this.listeners.pop()
  }
}
