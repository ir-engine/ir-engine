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

import { defineComponent, getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

export const enum StandardCallbacks {
  PLAY = 'xre.play',
  PAUSE = 'xre.pause',
  STOP = 'xre.stop',
  RESET = 'xre.reset'
}

export const CallbackComponent = defineComponent({
  name: 'CallbackComponent',
  onInit: () => new Map<string, (...params: any) => void>()
})

export function setCallback(entity: Entity, key: string, callback: (...params: any) => void) {
  if (!hasComponent(entity, CallbackComponent)) setComponent(entity, CallbackComponent, new Map())
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.set(key, callback)
  callbacks[key] = key // for inspector
}

export function removeCallback(entity: Entity, key: string) {
  if (!hasComponent(entity, CallbackComponent)) return
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.delete(key)
  callbacks[key] = undefined // for inspector
}

export function getCallback(entity: Entity, key: string): ((...params: any) => void) | undefined {
  if (!hasComponent(entity, CallbackComponent)) return undefined
  return getComponent(entity, CallbackComponent).get(key)
}

export function hasCallback(entity: Entity, key: string): boolean {
  if (!hasComponent(entity, CallbackComponent)) return false
  return !!getComponent(entity, CallbackComponent).get(key)
}
