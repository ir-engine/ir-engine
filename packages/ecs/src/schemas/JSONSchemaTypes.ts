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

import { Entity } from '../Entity'

export const Kind = Symbol('Kind')
export const NonSerializable = Symbol('NonSerializable')
export const Required = Symbol('Required')

type Kinds =
  | 'Null'
  | 'Undefined'
  | 'Void'
  | 'Number'
  | 'Bool'
  | 'String'
  | 'Enum'
  | 'Literal'
  | 'Object'
  | 'Record'
  | 'Partial'
  | 'Array'
  | 'Tuple'
  | 'Union'
  | 'Func'
  | 'Required'
  | 'NonSerialized'
  | 'Class'
  | 'Any'

export interface Schema {
  [Kind]: Kinds
  static: unknown
  properties?: unknown
  options?: Options<any>
}

export type Static<T extends Schema> = T['static']

export interface Options<V = unknown> {
  id?: string
  default?: any
  serialize?: (value: V) => unknown
  deserialize?: (curr: V, value: V) => V
  validate?: (value: V, prev: V, entity: Entity) => boolean
  [prop: string]: any
}

export interface TNullSchema extends Schema {
  [Kind]: 'Null'
  static: null
  options?: Options<this['static']>
}

export interface TUndefinedSchema extends Schema {
  [Kind]: 'Undefined'
  static: undefined
  options?: Options<this['static']>
}

export interface TVoidSchema extends Schema {
  [Kind]: 'Void'
  static: void
  options?: Options<this['static']>
}

export interface TNumberSchema extends Schema {
  [Kind]: 'Number'
  static: number
  options?: Options<this['static']> & {
    maximum?: number
    minimum?: number
  }
}

export interface TBoolSchema extends Schema {
  [Kind]: 'Bool'
  static: boolean
  options?: Options<this['static']>
}

export interface TStringSchema extends Schema {
  [Kind]: 'String'
  static: string
  options?: Options<this['static']>
}

export interface TEnumSchema<T extends Record<string, string | number>> extends Schema {
  [Kind]: 'Enum'
  static: T[keyof T]
  properties: T
  options?: Options<this['static']>
}

export type TLiteralValue = boolean | number | string
export interface TLiteralSchema<T extends TLiteralValue> extends Schema {
  [Kind]: 'Literal'
  static: T
  properties: T
  options?: Options<this['static']>
}

export type TPropertyKeySchema = TStringSchema | TNumberSchema
export type TPropertyKey = string | number
export type TProperties = Record<TPropertyKey, Schema>

type ObjectOptionalKeys<T extends TProperties> = {
  [K in keyof T]: undefined extends Static<T[K]> ? K : never
}[keyof T]

type ObjectNonOptionalKeys<T extends TProperties> = Exclude<keyof T, ObjectOptionalKeys<T>>

type ObjectStatic<T extends TProperties> = {
  [K in ObjectNonOptionalKeys<T>]: Static<T[K]>
} & {
  [K in ObjectOptionalKeys<T>]?: Static<T[K]>
}
export interface TObjectSchema<T extends TProperties> extends Schema {
  [Kind]: 'Object'
  static: ObjectStatic<T>
  properties: T
  options?: Options<this['static']>
}

type Key<K> = K extends PropertyKey ? K : never
type RecordStatic<K extends Schema, V extends Schema> = {
  [_ in Key<Static<K>>]: Static<V>
}

export interface TRecordSchema<K extends Schema, V extends Schema> extends Schema {
  [Kind]: 'Record'
  static: RecordStatic<K, V>
  properties: { key: K; value: V }
  options?: Options<this['static']>
}

export interface TPartialSchema<T extends Schema> extends Schema {
  [Kind]: 'Partial'
  static: Partial<Static<T>>
  properties: T
  options?: Options<this['static']>
}

type ArrayStatic<T extends Schema> = Static<T>[]
export interface TArraySchema<T extends Schema> extends Schema {
  [Kind]: 'Array'
  static: ArrayStatic<T>
  options?: Options<this['static']> & {
    minItem?: number
    maxItem?: number
  }
  properties: T
}

type TupleStatic<T extends Schema[]> = [...{ [K in keyof T]: Static<T[K]> }]
export interface TTupleSchema<T extends Schema[]> extends Schema {
  [Kind]: 'Tuple'
  static: TupleStatic<T>
  properties: T
  options?: Options<this['static']>
}

type UnionStatic<T extends Schema[]> = {
  [K in keyof T]: T[K] extends Schema ? Static<T[K]> : never
}[number]
export interface TUnionSchema<T extends Schema[]> extends Schema {
  [Kind]: 'Union'
  static: UnionStatic<T>
  properties: T
  options?: Options<this['static']>
}

type ParamsStatic<T extends Schema[], Arr extends unknown[] = []> = T extends [
  infer L extends Schema,
  ...infer R extends Schema[]
]
  ? ParamsStatic<R, [...Arr, ...[Static<L>]]>
  : Arr
export interface TFuncSchema<Params extends Schema[], Return extends Schema> extends Schema {
  [Kind]: 'Func'
  static: (...params: ParamsStatic<Params>) => Static<Return>
  properties: { params: Params; return: Return }
  options?: Options<this['static']>
}

export interface TRequired {
  [Required]?: true
}
export interface TRequiredSchema<T extends Schema> extends Schema {
  [Kind]: 'Required'
  static: Static<T>
  properties: T
  options?: Options<this['static']>
  validator?: (value: Options<this['static']>) => boolean
}

export interface TNonSerializable {
  [NonSerializable]?: true
}
export interface TNonSerializedSchema<T extends Schema> extends Schema {
  [Kind]: 'NonSerialized'
  static: Static<T>
  properties: T
  options?: Options<this['static']>
}

export interface TClassSchema<T extends TProperties, Class> extends Schema {
  [Kind]: 'Class'
  static: Class
  properties: T
  options?: Options<this['static']>
}

export interface TTypedSchema<T> extends Schema {
  [Kind]: 'Any'
  static: T
  options?: Options<this['static']>
}

export type SerializedType<T> = T extends object
  ? {
      [K in keyof T]: [T[K]] extends [TNonSerializable]
        ? never
        : [T[K]] extends [(...args: any[]) => any]
        ? never
        : SerializedType<T[K]>
    }
  : T extends TNonSerializable
  ? never
  : T
