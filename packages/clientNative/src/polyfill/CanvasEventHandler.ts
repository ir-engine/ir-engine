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

import {NativePointerEvent, PointerEvent, PointerEvents} from 'react-native';

type DomEventHandler = (evt: NativePointerEvent) => void;
export type EventListenerRegistry = {
  addEventListener: (type: string, handler: DomEventHandler) => void;
  removeEventListener: (type: string, handler: DomEventHandler) => void;
};

export function createCanvasEventHandler() {
  const listenerRegistry: Map<string, Set<DomEventHandler>> = new Map();

  const addEventListener = (type: string, handler: DomEventHandler) => {
    let registry = listenerRegistry.get(type);
    if (!registry) {
      registry = new Set<DomEventHandler>();
      listenerRegistry.set(type, registry);
    }
    registry.add(handler);
  };
  const removeEventListener = (type: string, handler: DomEventHandler) => {
    const registry = listenerRegistry.get(type);
    if (registry) {
      registry.delete(handler);
    }
  };

  const firePointerEvent = (eventType: string, evt: PointerEvent) => {
    const listeners = listenerRegistry.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        listener({
          ...evt.nativeEvent,
          type: eventType,
        } as unknown as NativePointerEvent);
      }
    }
  };

  const eventListenerRegistry: EventListenerRegistry = {
    addEventListener,
    removeEventListener,
  };

  const pointerEvents: PointerEvents = {
    onPointerEnter: firePointerEvent.bind(null, 'pointerenter'),
    onPointerLeave: firePointerEvent.bind(null, 'pointerleave'),
    onPointerMove: firePointerEvent.bind(null, 'pointermove'),
    onPointerUp: firePointerEvent.bind(null, 'pointerup'),
    onPointerDown: firePointerEvent.bind(null, 'pointerdown'),
  };

  return {
    eventListenerRegistry,
    pointerEvents,
  };
}
