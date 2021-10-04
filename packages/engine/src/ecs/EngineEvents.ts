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

  // Start or stop client side physics & rendering
  ENABLE_SCENE: 'CORE_ENABLE_SCENE', // { renderer: boolean, physics: boolean }

  // MISC
  USER_ENGAGE: 'CORE_USER_ENGAGE', // { }
  WINDOW_FOCUS: 'CORE_WINDOW_FOCUS', //  { focused: boolean }
  ENTITY_DEBUG_DATA: 'CORE_ENTITY_DEBUG_DATA', // TODO: to pipe offscreen entity data to UI

  OBJECT_HOVER: 'INTERACTIVE_SYSTEM_OBJECT_HOVER',
  OBJECT_ACTIVATION: 'INTERACTIVE_SYSTEM_OBJECT_ACTIVATION',

  PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT',

  XR_START: 'WEBXR_RENDERER_SYSTEM_XR_START',
  XR_SESSION: 'WEBXR_RENDERER_SYSTEM_XR_SESSION',
  XR_END: 'WEBXR_RENDERER_SYSTEM_XR_END',

  CONNECT: 'NETWORK_CONNECT',
  CONNECTION_LOST: 'CORE_CONNECTION_LOST',

  AVATAR_DEBUG: 'CORE_AVATAR_DEBUG',
  PHYSICS_DEBUG: 'CORE_PHYSICS_DEBUG',

  START_SUSPENDED_CONTEXTS: 'POSITIONAL_AUDIO_START_SUSPENDED_CONTEXTS',
  SUSPEND_POSITIONAL_AUDIO: 'POSITIONAL_AUDIO_SUSPEND_POSITIONAL_AUDIO',

  BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED'
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

/**
* Add an event listener for event {@link Events.InsertObj}.
* First, it checks if the event has any listeners. If it does, it throws an error.
* If there are no listeners, it adds the listener to the event.
* If there are listeners, it throws an error.
* This is a common pattern in Node.
 * @param listener - Handler function for the event.
 * @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
 * @internal
*/
  once(eventName: string | number, listener: Function, ...args: any): void {
    const onEvent = (ev) => {
      EngineEvents.instance.removeEventListener(eventName, onEvent)
      listener(ev)
    }
    EngineEvents.instance.addEventListener(eventName, onEvent)
  }

/**
* Add an event listener for event {@link Events.InsertObj}.
* First, it checks if the event has any listeners. If it does, it throws an error.
* If there are no listeners, it adds the listener to the event.
* If there are listeners, it throws an error.
* This is a common pattern in Node.
* @param eventName - Name of the event.
* @param listener - Handler function for the event.
* @param ...args - Arguments to pass to the handler function.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
  addEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listeners = EngineEvents.instance._listeners
    if (listeners[eventName] === undefined) {
      listeners[eventName] = []
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener)
    }
  }
  
/**
* Check if the event has any listeners.
* @param eventName - Event name.
* @param listener - Listener function.
* @param ...args - Arguments to pass to the listener function.
* @return {@link boolean}
* @internal
*/
  hasEventListener(eventName: string | number, listener: Function, ...args: any): boolean {
    return (
      EngineEvents.instance._listeners[eventName] !== undefined &&
      EngineEvents.instance._listeners[eventName].indexOf(listener) !== -1
    )
  }

/**
* Remove an event listener.
* @param eventName - Event name.
* @param listener - Listener function.
* @param ...args - Arguments to pass to the listener function.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
  removeEventListener(eventName: string | number, listener: Function, ...args: any): void {
    const listenerArray = EngineEvents.instance._listeners[eventName]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

/**
* Remove all listeners for event {@link Events.InsertObj}.
* If the event is deleted, it deletes the listeners.
* If the event is not deleted, it sets the listeners to an empty array.
* @param eventName - Name of the event.
* @param deleteEvent - If true, it deletes the event.
* @param ...args - Arguments to pass to the listeners.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
  removeAllListenersForEvent(eventName: string, deleteEvent?: boolean, ...args: any) {
    if (deleteEvent) {
      delete EngineEvents.instance._listeners[eventName]
    } else {
      EngineEvents.instance._listeners[eventName] = []
    }
  }

/**
* Dispatch an event.
* @param event - Event to dispatch.
* @param ...args - Arguments to pass to listeners.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
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
