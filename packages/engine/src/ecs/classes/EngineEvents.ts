import type { MessageQueue } from '../../worker/MessageQueue'

/**
 *
 * @author Josh Field <github.com/HexaField>
 */
const EVENTS = {
  // TODO: add doc formatting to these

  // INITALIZATION
  RESET_ENGINE: 'CORE_RESET_ENGINE',
  INITIALIZED_ENGINE: 'CORE_INITIALIZED_ENGINE', // { }
  CONNECT_TO_WORLD: 'CORE_CONNECT_TO_WORLD', // { }
  CONNECT_TO_WORLD_TIMEOUT: 'CORE_CONNECT_TO_WORLD_TIMEOUT', // { }
  JOINED_WORLD: 'CORE_JOINED_WORLD', // { }
  LEAVE_WORLD: 'CORE_LEAVE_WORLD', // { }
  SCENE_LOADED: 'CORE_SCENE_LOADED', // { }
  CLIENT_USER_LOADED: 'CORE_CLIENT_USER_LOADED', // { }

  // Start or stop client side physics & rendering
  ENABLE_SCENE: 'CORE_ENABLE_SCENE', // { renderer: boolean, physics: boolean }

  // MISC
  USER_ENGAGE: 'CORE_USER_ENGAGE', // { }
  WINDOW_FOCUS: 'CORE_WINDOW_FOCUS', //  { focused: boolean }
  ENTITY_DEBUG_DATA: 'CORE_ENTITY_DEBUG_DATA' // TODO: to pipe offscreen entity data to UI
}

/**
 *
 * @author Josh Field <github.com/HexaField>
 */
export class EngineEvents {
  public static instance: EngineEvents = new EngineEvents()
  static EVENTS = EVENTS
  _listeners = {}
  public reset(): void {
    Object.keys(EngineEvents.instance._listeners).forEach((key) => {
      delete EngineEvents.instance._listeners[key]
    })
  }
  once(eventName: string | number, listener: Function, ...args: any): void {
    const onEvent = (ev) => {
      EngineEvents.instance.removeEventListener(eventName, onEvent)
      listener(ev)
    }
    EngineEvents.instance.addEventListener(eventName, onEvent)
  }
  addEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listeners = EngineEvents.instance._listeners
    if (listeners[eventName] === undefined) {
      listeners[eventName] = []
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener)
    }
  }
  hasEventListener(eventName: string | number, listener: Function, ...args: any): boolean {
    return (
      EngineEvents.instance._listeners[eventName] !== undefined &&
      EngineEvents.instance._listeners[eventName].indexOf(listener) !== -1
    )
  }
  removeEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listenerArray = EngineEvents.instance._listeners[eventName]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }
  removeAllListenersForEvent(eventName: string, deleteEvent?: boolean, ...args: any) {
    if (deleteEvent) {
      delete EngineEvents.instance._listeners[eventName]
    } else {
      EngineEvents.instance._listeners[eventName] = []
    }
  }
  dispatchEvent(event: { type: string; [attachment: string]: any }, ...args: any): void {
    const listenerArray = EngineEvents.instance._listeners[event.type]
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0)
      for (let i = 0; i < array.length; i++) {
        array[i].call(EngineEvents.instance, event, ...args)
      }
    }
  }
}

/**
 *
 * @author Josh Field <github.com/HexaField>
 */
const ENGINE_EVENTS_PROXY = {
  EVENT: 'ENGINE_EVENTS_PROXY_EVENT',
  EVENT_ADD: 'ENGINE_EVENTS_PROXY_EVENT_ADD',
  EVENT_ONCE: 'ENGINE_EVENTS_PROXY_EVENT_ONCE',
  EVENT_REMOVE: 'ENGINE_EVENTS_PROXY_EVENT_REMOVE',
  EVENT_REMOVE_ALL: 'ENGINE_EVENTS_PROXY_EVENT_REMOVE_ALL'
}

/**
 *
 * @author Josh Field <github.com/HexaField>
 */
export const proxyEngineEvents = (messageQueue: MessageQueue) => {
  const listener = (event: any) => {
    messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event })
  }
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ADD, (ev: any) => {
    const { type } = ev.detail
    EngineEvents.instance.addEventListener(type, listener, true)
  })
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ONCE, (ev: any) => {
    const { type } = ev.detail
    EngineEvents.instance.once(type, listener, true)
  })
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE, (ev: any) => {
    const { type } = ev.detail
    EngineEvents.instance.removeEventListener(type, listener, true)
  })
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE_ALL, (ev: any) => {
    const { type, deleteEvent } = ev.detail
    EngineEvents.instance.removeAllListenersForEvent(type, deleteEvent, true)
  })
  messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT, (ev: any) => {
    const { event } = ev.detail
    EngineEvents.instance.dispatchEvent(event, true)
  })

  const _addEventListener = EngineEvents.instance.addEventListener
  EngineEvents.instance.addEventListener = function (type: string, listener: any, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ADD, { type })
    }
    _addEventListener(type, listener)
  }.bind(EngineEvents.instance)

  const _once = EngineEvents.instance.once
  EngineEvents.instance.once = function (type: string, listener: any, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ONCE, { type })
    }
    _once(type, listener)
  }.bind(EngineEvents.instance)

  const _removeEventListener = EngineEvents.instance.removeEventListener
  EngineEvents.instance.removeEventListener = function (type: string, listener: any, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE, { type })
    }
    _removeEventListener(type, listener)
  }.bind(EngineEvents.instance)

  const _removeAllListenersForEvent = EngineEvents.instance.removeAllListenersForEvent
  EngineEvents.instance.removeAllListenersForEvent = function (type: string, deleteEvent: boolean, fromSelf?: boolean) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE_ALL, { type, deleteEvent })
    }
    _removeAllListenersForEvent(type, deleteEvent)
  }.bind(EngineEvents.instance)

  const _dispatchEvent = EngineEvents.instance.dispatchEvent
  EngineEvents.instance.dispatchEvent = function (event: any, fromSelf?: boolean, transferable?: Transferable[]) {
    if (!fromSelf) {
      messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event }, transferable)
    }
    _dispatchEvent(event)
  }.bind(EngineEvents.instance)
}
