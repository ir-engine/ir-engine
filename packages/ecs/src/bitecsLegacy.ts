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

export type ComponentProp = TypedArray | Array<TypedArray>

export interface IComponentProp {}

export interface IComponent {}

export type Component = IComponent | ComponentType<ISchema>

export type Query<W extends IWorld = IWorld> = (world: W) => readonly EntityId[]

export function defineQuery(components: QueryTerm[]) {
  const queryFn = (world: IWorld) => query(world, components)
  queryFn.components = components
  return queryFn
}

export function enterQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> & { unsubscribe: () => void } {
  let queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      queue.push(...queryFn(world))
      query.unsubscribe = observe(world, onAdd(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      initSet.add(world)
    }
    const results = queue.slice()
    queue.length = 0
    return results
  }
  query.unsubscribe = () => {}
  return query
}

export function exitQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> & { unsubscribe: () => void } {
  let queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      query.unsubscribe = observe(world, onRemove(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      initSet.add(world)
    }
    const results = queue.slice()
    queue.length = 0
    return results
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

export interface ISchema {
  [key: string]: Type | ListType | ISchema
}

export type Type = 'i8' | 'ui8' | 'ui8c' | 'i16' | 'ui16' | 'i32' | 'ui32' | 'f32' | 'f64' | 'eid'

export type ListType = readonly [Type, number]

export const Types = {
  i8: 'i8' as const,
  ui8: 'ui8' as const,
  ui8c: 'ui8c' as const,
  i16: 'i16' as const,
  ui16: 'ui16' as const,
  i32: 'i32' as const,
  ui32: 'ui32' as const,
  f32: 'f32' as const,
  f64: 'f64' as const,
  eid: 'eid' as const
}

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

export type ArrayByType = {
  i8: Int8Array
  ui8: Uint8Array
  ui8c: Uint8ClampedArray
  i16: Int16Array
  ui16: Uint16Array
  i32: Int32Array
  ui32: Uint32Array
  f32: Float32Array
  f64: Float64Array
  eid: Uint32Array
}

// ... existing code ...

const arrayByTypeMap: { [key in Type]: any } = {
  i8: Int8Array,
  ui8: Uint8Array,
  ui8c: Uint8ClampedArray,
  i16: Int16Array,
  ui16: Uint16Array,
  i32: Int32Array,
  ui32: Uint32Array,
  f32: Float32Array,
  f64: Float64Array,
  eid: Uint32Array
}

export type ComponentType<T extends ISchema> = {
  [key in keyof T]: T[key] extends Type
    ? ArrayByType[T[key]]
    : T[key] extends [infer RT, number]
    ? RT extends Type
      ? Array<ArrayByType[RT]>
      : unknown
    : T[key] extends ISchema
    ? ComponentType<T[key]>
    : unknown
}

function createResizableTypeArray(type: Type) {
  const TypeConstructor = arrayByTypeMap[type]
  if (TypeConstructor) {
    const buffer = new (ArrayBuffer as any)(0, { maxByteLength: Math.pow(2, 20) })
    return new TypeConstructor(buffer)
  } else {
    throw new Error(`Unsupported SoA type: ${type}`)
  }
}

export const defineComponent = <T extends ISchema>(schema: T): ComponentType<T> => {
  const createSoA = <U extends ISchema>(schema: U): ComponentType<U> => {
    const component = {} as ComponentType<U>
    for (const key in schema) {
      if (typeof schema[key] === 'string') {
        const type = schema[key] as Type
        component[key] = createResizableTypeArray(type)
      } else if (typeof schema[key] === 'object') {
        component[key] = createSoA(schema[key] as ISchema) as any
      } else {
        throw new Error(`Unsupported SoA type: ${schema[key]}`)
      }
    }
    return component
  }
  return createSoA(schema)
}
