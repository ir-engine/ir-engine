/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/**
 * This class provides methods to manage events dispatches.
 */
export class EventDispatcher {
  /** Map to store listeners by event names. */
  _listeners: any

  constructor() {
    this._listeners = {}
  }

  /** Resets the Dispatcher */
  public reset(): void {
    Object.keys(this._listeners).forEach((key) => {
      delete this._listeners[key]
    })
  }

  once(eventName: string | number, listener: any, ...args: any): void {
    const onEvent = (ev) => {
      this.removeEventListener(eventName, onEvent)
      listener(ev)
    }
    this.addEventListener(eventName, onEvent)
  }

  /**
   * Adds an event listener.
   * @param eventName Name of the event to listen.
   * @param listener Callback to trigger when the event is fired.
   */
  addEventListener(eventName: string | number, listener: any, ...args: any): void {
    const listeners = this._listeners
    if (listeners[eventName] === undefined) {
      listeners[eventName] = []
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener)
    }
  }

  /**
   * Checks if an event listener is already added to the list of listeners.
   * @param eventName Name of the event to check.
   * @param listener Callback for the specified event.
   */
  hasEventListener(eventName: string | number, listener: any, ...args: any): boolean {
    return this._listeners[eventName] !== undefined && this._listeners[eventName].indexOf(listener) !== -1
  }

  /**
   * Removes an event listener.
   * @param eventName Name of the event to remove.
   * @param listener Callback for the specified event.
   */
  removeEventListener(eventName: string | number, listener: any, ...args: any): void {
    const listenerArray = this._listeners[eventName]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

  /**
   * Removes all listeners for an event.
   * @param eventName Name of the event to remove.
   */
  removeAllListenersForEvent(eventName: string, deleteEvent?: boolean, ...args: any) {
    if (deleteEvent) {
      delete this._listeners[eventName]
    } else {
      this._listeners[eventName] = []
    }
  }

  /**
   * Dispatches an event with given Entity and Component and increases fired event's count.
   * @param eventName Name of the event to dispatch.
   */
  /**
   * Fire an event type.
   * @param type The type of event that gets fired.
   */
  dispatchEvent(event: { type: string; [attachment: string]: any }, ...args: any): void {
    const listenerArray = this._listeners[event.type]
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0)

      for (let i = 0; i < array.length; i++) {
        array[i].call(this, event, ...args)
      }
    }
  }
}
