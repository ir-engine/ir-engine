/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

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
