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
import { PeerID, UserID } from '@ir-engine/hyperflux'
import { Entity, EntityID, EntityUUID, EntityUUIDPair } from '../Entity'
import {
  Kind,
  Kinds,
  Options,
  Schema,
  TArraySchema,
  TBoolSchema,
  TClassSchema,
  TFuncSchema,
  TLiteralSchema,
  TLiteralValue,
  TNullSchema,
  TNumberSchema,
  TObjectSchema,
  TPartialSchema,
  TProperties,
  TProxySchema,
  TRecordSchema,
  TStringSchema,
  TTupleSchema,
  TTypedSchema,
  TUndefinedSchema,
  TUnionSchema,
  TVoidSchema
} from './JSONSchemaTypes'

const buildOptions = (options?: Options): Options => {
  const defaultOptions = {
    serialized: true
  }

  return { ...defaultOptions, ...options }
}

const buildSchema = <Opt extends Options>(kind: Kinds, options?: Opt) => {
  return {
    [Kind]: kind,
    options: buildOptions(options)
  }
}

export const S = {
  /** Schema that infers as a null */
  Null: (options?: TNullSchema['options']) =>
    ({
      ...buildSchema('Null', options)
    }) as TNullSchema,

  /** Schema that infers as a undefined */
  Undefined: (options?: TUndefinedSchema['options']) =>
    ({
      ...buildSchema('Undefined', options)
    }) as TUndefinedSchema,

  /** Schema that infers as a void for use with S.Func as a return schema */
  Void: (options?: TVoidSchema['options']) =>
    ({
      ...buildSchema('Void', options)
    }) as TVoidSchema,

  /** Schema that infers as a number, defaults to 0 */
  Number: (options?: TNumberSchema['options']) =>
    ({
      ...buildSchema('Number', options)
    }) as TNumberSchema,

  /** Schema that infers as a boolean, defaults to false */
  Bool: (options?: TBoolSchema['options']) =>
    ({
      ...buildSchema('Bool', options)
    }) as TBoolSchema,

  /** Schema that infers as a string, defaults to '' */
  String: (options?: TStringSchema['options']) =>
    ({
      ...buildSchema('String', options)
    }) as TStringSchema,

  /**
   * Schema that infers as the const values of an object, requires that the object to infer as be passed in, default to the first value of the object
   */
  Enum: <Value extends TLiteralValue>(
    item: Record<string, Value>,
    options?: TUnionSchema<TLiteralSchema<Value>[]>['options']
  ) => {
    const defaultItem = Object.values(item)[0]
    let deserialize
    if (typeof defaultItem === 'string') {
      // Handle migration from enum index to object value, eventually remove this
      deserialize = (curr, value) => {
        if (typeof value === 'number') return Object.values(item)[value]
        return value
      }
    }

    return S.LiteralUnion(Object.values(item), {
      default: defaultItem,
      deserialize: deserialize,
      ...options,
      metadata: { objectRef: item, ...options?.metadata }
    })
  },

  /**
   * Schema that infers as a literal value
   * S.Literal('test') -> 'test'
   */
  Literal: <T extends TLiteralValue>(item: T, options?: TLiteralSchema<T>['options']) =>
    ({
      ...buildSchema('Literal', options),
      properties: item
    }) as TLiteralSchema<T>,

  /**
   * Schema that infers as an object type of the properties provided, defaults to an empty object ({})
   * S.Object({ test: S.Number() }) -> { test: number }
   */
  Object: <T extends TProperties>(properties: T, options?: TObjectSchema<T>['options']) =>
    ({
      ...buildSchema('Object', options),
      properties: properties
    }) as TObjectSchema<T>,

  /**
   * Schema that infers as a record type of key and value schemas passed in, defaults to an empty object ({})
   * S.Record(S.String(), S.Number()) -> Record<string, number>
   */
  Record: <K extends Schema, V extends Schema>(key: K, value: V, options?: TRecordSchema<K, V>['options']) =>
    ({
      ...buildSchema('Record', options),
      properties: { key, value }
    }) as TRecordSchema<K, V>,

  /**
   * Schema that infers as a Partial type of the schema passed in
   * S.Partial(T.Vec3()) -> Partial<Vector3>
   */
  Partial: <T extends Schema>(item: T, options?: TPartialSchema<T>['options']) =>
    ({
      ...buildSchema('Partial', options),
      properties: item
    }) as TPartialSchema<T>,

  /**
   * Schema that infers as an array type of the schema passed in, defaults to []
   * S.Array(S.Number()) -> number[]
   */
  Array: <T extends Schema>(item: T, options?: TArraySchema<T>['options']) =>
    ({
      ...buildSchema('Array', options),
      properties: item
    }) as TArraySchema<T>,

  /**
   * Schema that infers as an tuple type of the schema passed in defaults to []
   * S.Tuple([S.Number(), S.Number()]) -> [number, number]
   */
  Tuple: <T extends Schema[]>(items: [...T], options?: TTupleSchema<T>['options']) =>
    ({
      ...buildSchema('Tuple', options),
      properties: items
    }) as TTupleSchema<T>,

  /**
   * Schema that infers as a union type of the schemas provided, defaults to the default value of the first element in the union
   * It will serialize as the first schema in the array that matches the value's shape
   * */
  Union: <T extends Schema[]>(schemas: [...T], options?: TUnionSchema<T>['options']) =>
    ({
      ...buildSchema('Union', options),
      properties: schemas
    }) as TUnionSchema<T>,

  /** Schema that infers as a literal union (ie. 'key' | 'value') */
  LiteralUnion: <T extends TLiteralValue>(items: T[], options?: TUnionSchema<TLiteralSchema<T>[]>['options']) =>
    S.Union([...items.map((lit) => S.Literal(lit))], options),

  /**
   * Schema that infers as the return type of the function passed in, not serialized
   */
  Class: <T extends TProperties, Class>(init: () => Class, options?: TClassSchema<T, Class>['options']) =>
    ({
      ...buildSchema('Class', { default: init, ...options }),
      properties: {} as T
    }) as TClassSchema<T, Class>,

  /**
   * Schema that infers as the return type of the function passed in
   * if properties are passed in, those values will be serialized, otherwise it will not be serialized
   * Can provide a serializer function that can be used for custom serialization
   */
  SerializedClass: <T extends TProperties, Class>(items: T, options?: TClassSchema<T, Class>['options']) =>
    ({
      ...buildSchema('Class', { serialized: true, id: 'SerializedClass', ...options }),
      properties: items
    }) as TClassSchema<T, Class>,

  /**
   *
   * Schema of a function type, is not serializable
   *
   * @param parameters array of schemas to infer the type of the parameters
   * @param returns schema to infer the return type of the function
   * @param init initial value
   * @param options schema option
   * @returns
   */
  Func: <Params extends Schema[], Return extends Schema, Initial extends (...params: any[]) => any>(
    parameters: [...Params],
    returns: Return,
    options?: TFuncSchema<Params, Return>['options']
  ) =>
    ({
      ...buildSchema('Func', options),
      properties: { params: parameters, return: returns }
    }) as TFuncSchema<Params, Return>,

  Call: <Initial extends (...params: any[]) => any>(options?: TFuncSchema<Schema[], TVoidSchema>['options']) =>
    S.Func([], S.Void(), options),

  /**
   * Schemas wrapped in this schema are optional values that can be undefined, will default to undefined if not default value is provided
   */
  Optional: <T extends Schema>(schema: T, options?: TUnionSchema<[T, TUndefinedSchema]>['options']) =>
    S.Union([S.Undefined(), schema], options),

  /**
   *
   * Creates a schema object that infers to the generic type provided
   * Only the properties that are passed in on the props object will be serialized, if none are provided the value will not be serialized
   *
   * @param options schema options
   * @param props the properties you want to be serialized for the type
   * @returns
   */
  Type: <T>(options?: TTypedSchema<T>['options'], props?: TProperties) =>
    S.SerializedClass(props ?? {}, { default: () => undefined, ...options }) as unknown as TTypedSchema<T>,

  /**
   * Create a schema object that infers as an any type, the value is serialized
   */
  Any: () =>
    ({
      ...buildSchema('Any')
    }) as TTypedSchema<any>,

  /** Entity type schema helper, Entities will not be serialized, defaults to UndefinedEntity */
  Entity: (options?: TTypedSchema<Entity>['options']) =>
    S.Number({ serialized: true, id: 'Entity', ...options }) as unknown as TTypedSchema<Entity>,

  /** EntityUUID type schema helper, defaults to '' */
  EntityUUID: (options?: TTypedSchema<EntityUUID>['options']) =>
    S.String({ serialized: true, ...options, id: 'EntityUUID' }) as unknown as TTypedSchema<EntityUUID>,

  /** EntityUUID type schema helper, defaults to '' */
  EntityID: (options?: TTypedSchema<EntityID>['options']) =>
    S.String({ serialized: true, ...options, id: 'EntityID' }) as unknown as TTypedSchema<EntityID>,

  /** EntityUUIDPair type schema helper, defaults to {instanceID: '', id: ''} */
  EntityUUIDPair: (options?: TTypedSchema<EntityUUIDPair>['options']) =>
    S.Object({ entitySourceID: S.String(), entityID: S.EntityID() }) as unknown as TTypedSchema<EntityUUIDPair>,

  /** UserID type schema helper, defaults to '' */
  UserID: (options?: TTypedSchema<UserID>['options']) =>
    S.String({ serialized: true, ...options, id: 'UserUUID' }) as unknown as TTypedSchema<UserID>,

  /** PeerID type schema helper, defaults to '' */
  PeerID: (options?: TTypedSchema<PeerID>['options']) =>
    S.String({ serialized: true, ...options, id: 'PeerUUID' }) as unknown as TTypedSchema<PeerID>,

  Proxy: <T extends Schema>(schema: T) =>
    ({
      ...buildSchema('Proxy', { serialized: true }),
      properties: schema
    }) as TProxySchema<T>
}
