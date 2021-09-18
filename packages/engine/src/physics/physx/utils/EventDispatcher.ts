export class EventDispatcher {
  eventListener: any
  _listeners: any

  constructor() {
    this._listeners = {}
  }

  once(type: string, listener: any) {
    const once = (ev) => {
      listener(ev)
      this.removeEventListener(type, once)
    }
    this.addEventListener(type, once)
  }

  addEventListener(type: string, listener: any) {
    if (this._listeners[type] === undefined) {
      this._listeners[type] = []
    }
    if (this._listeners[type].indexOf(listener) === -1) {
      this._listeners[type].push(listener)
    }
  }

  hasEventListener(type: string, listener: any) {
    return this._listeners[type] !== undefined && this._listeners[type].indexOf(listener) !== -1
  }

  removeEventListener(type: string, listener: any) {
    const listenerArray = this._listeners[type]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

  dispatchEvent(event: any, fromSelf?: boolean) {
    const listenerArray = this._listeners[event.type]
    if (listenerArray !== undefined) {
      event.target = this
      const array = listenerArray.slice(0)
      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event)
      }
    }
  }
}
