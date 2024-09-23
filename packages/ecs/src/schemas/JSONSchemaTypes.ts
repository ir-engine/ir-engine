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
  | 'Union'
  | 'Func'
  | 'Required'
  | 'NonSerialized'
  | 'Class'
  | 'Any'

export interface Options {
  id?: string
  default?: any
  [prop: string]: any
}

export interface Schema {
  [Kind]: Kinds
  static: unknown
  properties?: unknown
  options?: Options
  serializer?: (value: unknown) => unknown
}

export type Static<T extends Schema> = T['static']

export interface TNullSchema extends Schema {
  [Kind]: 'Null'
  static: null
}

export interface TUndefinedSchema extends Schema {
  [Kind]: 'Undefined'
  static: undefined
}

export interface TVoidSchema extends Schema {
  [Kind]: 'Void'
  static: void
}

export interface TNumberSchema extends Schema {
  [Kind]: 'Number'
  static: number
  options?: Options & {
    maximum?: number
    minimum?: number
  }
}

export interface TBoolSchema extends Schema {
  [Kind]: 'Bool'
  static: boolean
}

export interface TStringSchema extends Schema {
  [Kind]: 'String'
  static: string
}

export interface TEnumSchema<T extends object> extends Schema {
  [Kind]: 'Enum'
  static: T[keyof T]
  properties: T
}

export type TLiteralValue = boolean | number | string
export interface TLiteralSchema<T extends TLiteralValue> extends Schema {
  [Kind]: 'Literal'
  static: T
  properties: T
}

export type TPropertyKeySchema = TStringSchema | TNumberSchema
export type TPropertyKey = string | number
export type TProperties = Record<TPropertyKey, Schema>

type ObjectStatic<T extends TProperties> = {
  [K in keyof T]: Static<T[K]>
}
export interface TObjectSchema<T extends TProperties> extends Schema {
  [Kind]: 'Object'
  static: ObjectStatic<T>
  properties: T
}

type Key<K> = K extends PropertyKey ? K : never
type RecordStatic<K extends Schema, V extends Schema> = {
  [_ in Key<Static<K>>]: Static<V>
}

export interface TRecordSchema<K extends Schema, V extends Schema> extends Schema {
  [Kind]: 'Record'
  static: RecordStatic<K, V>
  properties: { key: K; value: V }
}

export interface TPartialSchema<T extends Schema> extends Schema {
  [Kind]: 'Partial'
  static: Partial<Static<T>>
  properties: T
}

type ArrayStatic<T extends Schema> = Static<T>[]
export interface TArraySchema<T extends Schema> extends Schema {
  [Kind]: 'Array'
  static: ArrayStatic<T>
  options?: Options & {
    minItem?: number
    maxItem?: number
  }
  properties: T
}

type UnionStatic<T extends Schema[]> = {
  [K in keyof T]: T[K] extends Schema ? Static<T[K]> : never
}[number]
export interface TUnionSchema<T extends Schema[]> extends Schema {
  [Kind]: 'Union'
  static: UnionStatic<T>
  properties: T
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
}

export interface TRequired {
  [Required]?: true
}
export interface TRequiredSchema<T extends Schema> extends Schema {
  [Kind]: 'Required'
  static: Static<T> & TRequired
  properties: T
}

export interface TNonSerializable {
  [NonSerializable]?: true
}
export interface TNonSerializedSchema<T extends Schema> extends Schema {
  [Kind]: 'NonSerialized'
  static: Static<T> & TNonSerializable
  properties: T
}

export interface TClassSchema<T extends TProperties, Class> extends Schema {
  [Kind]: 'Class'
  static: Class
  properties: T
  serializer?: (value: Class) => any
}

export interface TTypedSchema<T> extends Schema {
  [Kind]: 'Any'
  static: T
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
