import { createWorld, resetWorld, deleteWorld } from './World'
import { bit_addEntity, bit_removeEntity, setDefaultSize, bit_getEntityComponents } from './Entity'
import {
  bit_defineComponent,
  bit_registerComponent,
  bit_registerComponents,
  bit_hasComponent,
  bit_addComponent,
  bit_removeComponent
} from './Component'
import { defineSystem } from './System'
import {
  defineQuery,
  enterQuery,
  exitQuery,
  Changed,
  Not,
  commitRemovals,
  resetChangedQuery,
  removeQuery
} from './Query'
import { defineSerializer, defineDeserializer, DESERIALIZE_MODE } from './Serialize'
import { TYPES_ENUM, parentArray } from './Storage'
// import { defineProxy } from './Proxy'

export const pipe =
  (...fns) =>
  (...args) => {
    const input = Array.isArray(args[0]) ? args[0] : args
    if (!input || input.length === 0) return
    fns = Array.isArray(fns[0]) ? fns[0] : fns
    let tmp = input
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i]
      if (Array.isArray(tmp)) {
        // tmp = tmp.reduce((a,v) => a.concat(fn(v)),[])
        tmp = fn(...tmp)
      } else {
        tmp = fn(tmp)
      }
    }
    return tmp
  }

// export const Types = TYPES_ENUM

export {
  setDefaultSize,
  createWorld,
  resetWorld,
  deleteWorld,
  bit_addEntity,
  bit_removeEntity,
  bit_registerComponent,
  bit_registerComponents,
  bit_defineComponent,
  bit_addComponent,
  bit_removeComponent,
  bit_hasComponent,
  bit_getEntityComponents,
  // entityChanged,

  // defineProxy,

  defineQuery,
  Changed,
  Not,
  // Or,
  enterQuery,
  exitQuery,
  commitRemovals,
  resetChangedQuery,
  removeQuery,
  defineSystem,
  defineSerializer,
  defineDeserializer,
  DESERIALIZE_MODE,
  parentArray
}

export interface IWorld {
  [key: string]: any
}
export type System = (world: IWorld, ...args: any[]) => IWorld

export type Type = 'i8' | 'ui8' | 'ui8c' | 'i16' | 'ui16' | 'i32' | 'ui32' | 'f32' | 'f64'
export const Types: {
  i8: 'i8'
  ui8: 'ui8'
  ui8c: 'ui8c'
  i16: 'i16'
  ui16: 'ui16'
  i32: 'i32'
  ui32: 'ui32'
  f32: 'f32'
  f64: 'f64'
} = {
  i8: 'i8',
  ui8: 'ui8',
  ui8c: 'ui8c',
  i16: 'i16',
  ui16: 'ui16',
  i32: 'i32',
  ui32: 'ui32',
  f32: 'f32',
  f64: 'f64'
}

export type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type ListType = readonly [Type, number]

export interface ISchema {
  [key: string]: Type | ListType | ISchema
}

export type ArrayByType = {
  [Types.i8]: Int8Array
  [Types.ui8]: Uint8Array
  [Types.ui8c]: Uint8ClampedArray
  [Types.i16]: Int16Array
  [Types.ui16]: Uint16Array
  [Types.i32]: Int32Array
  [Types.ui32]: Uint32Array
  [Types.f32]: Float32Array
  [Types.f64]: Float64Array
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
