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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

/*
 * Parts of this legacy module are based on MPL licensed code from
 * https://github.com/NateTheGreatt/bitECS, which as been adapted to support
 * resizeable typed arrays.
 */

import {
  ComponentRef,
  EntityId,
  QueryTerm,
  addComponent as ecsAddComponent,
  hasComponent as ecsHasComponent,
  removeComponent as ecsRemoveComponent,
  observe,
  onAdd,
  onRemove,
  query
} from 'bitecs'

export interface IWorld {}

export type Query<W extends IWorld = IWorld> = (world: W) => readonly EntityId[]

export function defineQuery(components: QueryTerm[]) {
  const queryFn = (world: IWorld) => query(world, components)
  queryFn.components = components
  return queryFn
}

export function enterQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> & { unsubscribe: () => void } {
  const queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      initSet.add(world)
      queue.push(...queryFn(world))
      const unsub = observe(world, onAdd(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      query.unsubscribe = () => {
        unsub()
        queue.length = 0
      }
    }
    if (queue.length) {
      const results = queue.slice()
      queue.length = 0
      return results
    } else {
      return queue
    }
  }
  query.unsubscribe = () => {}
  return query
}

export function exitQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> & { unsubscribe: () => void } {
  const queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      initSet.add(world)
      const unsub = observe(world, onRemove(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      query.unsubscribe = () => {
        unsub()
        queue.length = 0
      }
    }
    if (queue.length) {
      const results = queue.slice()
      queue.length = 0
      return results
    } else {
      return queue
    }
  }
  query.unsubscribe = () => {}
  return query
}

export const addComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsAddComponent(world, eid, component)

export const hasComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsHasComponent(world, eid, component)

export const removeComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsRemoveComponent(world, eid, component)

export type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Int8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor

export function createResizableTypeArray<T extends TypedArrayConstructor>(TypeConstructor: T) {
  // @ts-ignore - maxByteLength not included in TS definitions
  const buffer = new ArrayBuffer(0, { maxByteLength: Math.pow(2, 20) })
  return new TypeConstructor(buffer) as InstanceType<T>
}

export type ResizableArray = ReturnType<typeof createResizableTypeArray>
