/**
 *
 * @author Josh Field <github.com/HexaField>
 */

const EVENTS = {
  // TODO: add doc formatting to these
  SCENE_LOADED: 'CORE_SCENE_LOADED' as const, // { }
  SCENE_LOADING: 'CORE_SCENE_LOADING' as const, // { }
  LOADING_PROGRESS: 'ENGINE_LOADING_PROGRESS' as const,
  SET_TELEPORTING: 'ENGINE_SET_TELEPORTING' as const,
  // INITALIZATION
  RESET_ENGINE: 'CORE_RESET_ENGINE' as const,
  INITIALIZED_ENGINE: 'CORE_INITIALIZED_ENGINE' as const, // { }
  CONNECT_TO_WORLD: 'CORE_CONNECT_TO_WORLD' as const, // { }
  CONNECT_TO_WORLD_TIMEOUT: 'CORE_CONNECT_TO_WORLD_TIMEOUT' as const, // { }
  JOINED_WORLD: 'CORE_JOINED_WORLD' as const, // { }
  LEAVE_WORLD: 'CORE_LEAVE_WORLD' as const, // { }
  SCENE_ENTITY_LOADED: 'CORE_SCENE_ENTITY_LOADED' as const, // { }

  // Start or stop client side physics & rendering
  ENABLE_SCENE: 'CORE_ENABLE_SCENE' as const, // { renderer: boolean, physics: boolean }

  // MISC

  USER_AVATAR_TAPPED: 'USER_AVATAR_TAPPED' as const,

  OBJECT_HOVER: 'INTERACTIVE_SYSTEM_OBJECT_HOVER' as const,
  OBJECT_ACTIVATION: 'INTERACTIVE_SYSTEM_OBJECT_ACTIVATION' as const,

  PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT' as const,

  XR_START: 'WEBXR_RENDERER_SYSTEM_XR_START' as const,
  XR_SESSION: 'WEBXR_RENDERER_SYSTEM_XR_SESSION' as const,
  XR_END: 'WEBXR_RENDERER_SYSTEM_XR_END' as const,

  CONNECT: 'NETWORK_CONNECT' as const,

  AVATAR_DEBUG: 'CORE_AVATAR_DEBUG' as const,
  PHYSICS_DEBUG: 'CORE_PHYSICS_DEBUG' as const,

  START_SUSPENDED_CONTEXTS: 'POSITIONAL_AUDIO_START_SUSPENDED_CONTEXTS' as const,
  SUSPEND_POSITIONAL_AUDIO: 'POSITIONAL_AUDIO_SUSPEND_POSITIONAL_AUDIO' as const,

  BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED' as const
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
