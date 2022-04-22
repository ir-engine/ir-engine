export class WebXREventDispatcher {
  public static instance: WebXREventDispatcher = new WebXREventDispatcher()
  _listeners = {}
  public reset(): void {
    Object.keys(WebXREventDispatcher.instance._listeners).forEach((key) => {
      delete WebXREventDispatcher.instance._listeners[key]
    })
  }
  once(eventName: string | number, listener: Function, ...args: any): void {
    const onEvent = (ev) => {
      WebXREventDispatcher.instance.removeEventListener(eventName, onEvent)
      listener(ev)
    }
    WebXREventDispatcher.instance.addEventListener(eventName, onEvent)
  }
  addEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listeners = WebXREventDispatcher.instance._listeners
    if (listeners[eventName] === undefined) {
      listeners[eventName] = []
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener)
    }
  }
  hasEventListener(eventName: string | number, listener: Function, ...args: any): boolean {
    return (
      WebXREventDispatcher.instance._listeners[eventName] !== undefined &&
      WebXREventDispatcher.instance._listeners[eventName].indexOf(listener) !== -1
    )
  }
  removeEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listenerArray = WebXREventDispatcher.instance._listeners[eventName]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }
  removeAllListenersForEvent(eventName: string, deleteEvent?: boolean, ...args: any) {
    if (deleteEvent) {
      delete WebXREventDispatcher.instance._listeners[eventName]
    } else {
      WebXREventDispatcher.instance._listeners[eventName] = []
    }
  }
  dispatchEvent(event: { type: string; [attachment: string]: any }, ...args: any): void {
    const listenerArray = WebXREventDispatcher.instance._listeners[event.type]
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0)
      for (let i = 0; i < array.length; i++) {
        array[i].call(WebXREventDispatcher.instance, event, ...args)
      }
    }
  }
}
