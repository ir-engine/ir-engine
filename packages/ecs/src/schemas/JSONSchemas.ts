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
import { UserID } from '@ir-engine/hyperflux'
import { Color, ColorRepresentation, Matrix4, Quaternion, Vector2, Vector3 } from 'three'
import { Entity, EntityUUID, UndefinedEntity } from '../Entity'
import {
  Kind,
  Options,
  Schema,
  TArraySchema,
  TBoolSchema,
  TClassSchema,
  TEnumSchema,
  TFuncSchema,
  TLiteralSchema,
  TLiteralValue,
  TNonSerializedSchema,
  TNullSchema,
  TNumberSchema,
  TObjectSchema,
  TPartialSchema,
  TProperties,
  TRecordSchema,
  TRequiredSchema,
  TStringSchema,
  TTupleSchema,
  TTypedSchema,
  TUndefinedSchema,
  TUnionSchema,
  TVoidSchema
} from './JSONSchemaTypes'

const buildOptions = (init: any | undefined, options?: Options) => {
  const opt =
    init !== undefined
      ? {
          default: init,
          ...options
        }
      : options
  return opt
}

const isColorObj = (color?: ColorRepresentation): color is Color => {
  return color !== undefined && (color as Color).r !== undefined
}

export const S = {
  /** Schema that infers as a null */
  Null: (options?: TNullSchema['options']) =>
    ({
      [Kind]: 'Null',
      options: options
    }) as TNullSchema,

  /** Schema that infers as a undefined */
  Undefined: (options?: TUndefinedSchema['options']) =>
    ({
      [Kind]: 'Undefined',
      options: options
    }) as TUndefinedSchema,

  /** Schema that infers as a void for use with S.Func as a return schema */
  Void: (options?: TVoidSchema['options']) =>
    ({
      [Kind]: 'Void',
      options: options
    }) as TVoidSchema,

  /** Schema that infers as a number, defaults to 0 */
  Number: (init?: number, options?: TNumberSchema['options']) =>
    ({
      [Kind]: 'Number',
      options: buildOptions(init ?? 0, options)
    }) as TNumberSchema,

  /** Schema that infers as a boolean, defaults to false */
  Bool: (init?: boolean, options?: TBoolSchema['options']) =>
    ({
      [Kind]: 'Bool',
      options: buildOptions(init ?? false, options)
    }) as TBoolSchema,

  /** Schema that infers as a string, defaults to '' */
  String: (init?: string, options?: TStringSchema['options']) =>
    ({
      [Kind]: 'String',
      options: buildOptions(init ?? '', options)
    }) as TStringSchema,

  /**
   * Schema that infers as a enum,requires that the enum to infer as be passed in
   */
  Enum: <T extends Record<string, string | number>>(
    item: T,
    init?: string | number,
    options?: TEnumSchema<T>['options']
  ) =>
    ({
      [Kind]: 'Enum',
      options: buildOptions(init, options),
      properties: item
    }) as TEnumSchema<T>,

  /**
   * Schema that infers as a literal value
   * S.Literal('test') -> 'test'
   */
  Literal: <T extends TLiteralValue>(item: T, init?: T, options?: TLiteralSchema<T>['options']) =>
    ({
      [Kind]: 'Literal',
      options: buildOptions(init, options),
      properties: item
    }) as TLiteralSchema<T>,

  /**
   * Schema that infers as an object type of the properties provided
   * S.Object({ test: S.Number() }) -> { test: number }
   */
  Object: <T extends TProperties, Initial>(properties: T, init?: Initial, options?: TObjectSchema<T>['options']) =>
    ({
      [Kind]: 'Object',
      options: buildOptions(init, options),
      properties: properties
    }) as TObjectSchema<T>,

  /**
   * Schema that infers as a record type of key and value schemas passed in
   * S.Record(S.String(), S.Number()) -> Record<string, number>
   */
  Record: <K extends Schema, V extends Schema, Initial>(
    key: K,
    value: V,
    init?: Initial,
    options?: TRecordSchema<K, V>['options']
  ) =>
    ({
      [Kind]: 'Record',
      options: buildOptions(init, options),
      properties: { key, value }
    }) as TRecordSchema<K, V>,

  /**
   * Schema that infers as a Partial type of the schema passed in
   * S.Partial(S.Vec3()) -> Partial<Vector3>
   */
  Partial: <T extends Schema, Initial>(item: T, init?: Initial, options?: TPartialSchema<T>['options']) =>
    ({
      [Kind]: 'Partial',
      options: buildOptions(init, options),
      properties: item
    }) as TPartialSchema<T>,

  /**
   * Schema that infers as an array type of the schema passed in
   * S.Array(S.Number()) -> number[]
   */
  Array: <T extends Schema, Initial extends any[]>(item: T, init?: Initial, options?: TArraySchema<T>['options']) =>
    ({
      [Kind]: 'Array',
      options: buildOptions(init ?? [], options),
      properties: item
    }) as TArraySchema<T>,

  /**
   * Schema that infers as an tuple type of the schema passed in
   * S.Tuple([S.Number(), S.Number()]) -> [number, number]
   */
  Tuple: <T extends Schema[], Initial extends any[]>(
    items: [...T],
    init?: Initial,
    options?: TTupleSchema<T>['options']
  ) =>
    ({
      [Kind]: 'Tuple',
      options: buildOptions(init ?? [], options),
      properties: items
    }) as TTupleSchema<T>,

  /**
   * Schema that infers as a union type of the schemas provided
   * It will serialize as the first schema in the array that matches the value's shape
   * */
  Union: <T extends Schema[], Initial>(schemas: [...T], init?: Initial, options?: TUnionSchema<T>['options']) =>
    ({
      [Kind]: 'Union',
      options: buildOptions(init, options),
      properties: schemas
    }) as TUnionSchema<T>,

  /** Schema that infers as a literal union (ie. 'key' | 'value') */
  LiteralUnion: <T extends TLiteralValue>(
    items: T[],
    init?: T,
    options?: TUnionSchema<TLiteralSchema<T>[]>['options']
  ) => S.Union([...items.map((lit) => S.Literal(lit))], init, options),

  /**
   * Schema that infers as the return type of the function passed in, not serialized
   */
  Class: <T extends TProperties, Class>(init: () => Class, options?: TClassSchema<T, Class>['options']) =>
    ({
      [Kind]: 'Class',
      options: {
        default: init
      },
      properties: {}
    }) as TClassSchema<T, Class>,

  /**
   * Schema that infers as the return type of the function passed in
   * if properties are passed in, those values will be serialized, otherwise it will not be serialized
   * Can provide a serializer function that can be used for custom serialization
   */
  SerializedClass: <T extends TProperties, Class>(
    init: () => Class,
    items: T,
    options?: TClassSchema<T, Class>['options']
  ) =>
    ({
      [Kind]: 'Class',
      options: {
        ...options,
        default: init
      },
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
    init?: Initial,
    options?: TFuncSchema<Params, Return>['options']
  ) =>
    ({
      [Kind]: 'Func',
      options: buildOptions(() => init, options),
      properties: { params: parameters, return: returns }
    }) as TFuncSchema<Params, Return>,

  Call: <Initial extends (...params: any[]) => any>(
    init?: Initial,
    options?: TFuncSchema<Schema[], TVoidSchema>['options']
  ) => S.Func([], S.Void(), init, options),

  /**
   * Schemas wrapped in this schema may be null and will default to null if not default value is provided
   */
  Nullable: <T extends Schema, Initial>(
    schema: T,
    init?: Initial,
    options?: TUnionSchema<[T, TNullSchema]>['options']
  ) => S.Union([schema, S.Null()], init ?? null, options),

  /**
   * Schemas wrapped in this schema are optional values that can be undefined
   */
  Optional: <T extends Schema, Initial>(
    schema: T,
    init?: Initial,
    options?: TUnionSchema<[T, TUndefinedSchema]>['options']
  ) => S.Union([schema, S.Undefined()], init ?? null, options),

  /**
   *
   * Schemas wrapped in this schema are required to be provided when a component is set or will throw an error
   *
   * Throws error
   * S.Object({ test: S.Required(S.Number(0)) })
   * setComponent(entity, Component, {})
   *
   * No error thrown
   * S.Object({ test: S.Required(S.Number(0)) })
   * setComponent(entity, Component, {test: 0})
   *
   */
  Required: <T extends Schema, Initial>(schema: T, init?: Initial, options?: TRequiredSchema<T>['options']) =>
    ({
      [Kind]: 'Required',
      options: buildOptions(init, options),
      properties: schema
    }) as TRequiredSchema<T>,

  /**
   *
   * Schemas wrapped in this schema will be ignored during serialization
   *
   * S.Object({ test: S.Number(0) }) serializes to { test: 0 }
   * S.Object({ test: S.NonSerialized(S.Number(0)) }) serializes to {}
   * S.NonSerialized(S.Object({ test: S.Number(0) })) serializes to null
   *
   */
  NonSerialized: <T extends Schema, Initial>(schema: T, init?: Initial, options?: TNonSerializedSchema<T>['options']) =>
    ({
      [Kind]: 'NonSerialized',
      options: buildOptions(init, options),
      properties: schema
    }) as TNonSerializedSchema<T>,

  /** EntityUUID type schema helper, defaults to UndefinedEntity */
  Entity: (def?: Entity) => S.Number(def ?? UndefinedEntity, { $id: 'Entity' }) as unknown as TTypedSchema<Entity>,

  /** EntityUUID type schema helper, defaults to '' */
  EntityUUID: (options?: TTypedSchema<EntityUUID>['options']) =>
    S.String('', { id: 'EntityUUID' }) as unknown as TTypedSchema<EntityUUID>,

  /** UserID type schema helper, defaults to '' */
  UserID: (options?: TTypedSchema<UserID>['options']) =>
    S.String('', { id: 'UserUUID' }) as unknown as TTypedSchema<UserID>,

  /** Vector3 type schema helper, defaults to { x: 0, y: 0, z: 0 } */
  Vec3: (init = { x: 0, y: 0, z: 0 }, options?: Options<Vector3>) =>
    S.SerializedClass(
      () => new Vector3(init.x, init.y, init.z),
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number()
      },
      {
        initializer: (curr, value) => curr.copy(value),
        ...options,
        id: 'Vec3'
      }
    ),

  /** Vector2 type schema helper, defaults to { x: 0, y: 0 } */
  Vec2: (init = { x: 0, y: 0 }, options?: Options<Vector2>) =>
    S.SerializedClass(
      () => new Vector2(init.x, init.y),
      {
        x: S.Number(),
        y: S.Number()
      },
      {
        initializer: (curr, value) => curr.copy(value),
        ...options,
        id: 'Vec2'
      }
    ),

  /** Quaternion type schema helper, defaults to { x: 0, y: 0, z: 0, w: 1 } */
  Quaternion: (init = { x: 0, y: 0, z: 0, w: 1 }, options?: Options<Quaternion>) =>
    S.SerializedClass(
      () => new Quaternion(init.x, init.y, init.z, init.w),
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number(),
        w: S.Number()
      },
      {
        initializer: (curr, value) => curr.copy(value),
        ...options,
        id: 'Quaternion'
      }
    ),

  /** Matrix4 type schema helper, defaults to idenity matrix */
  Mat4: (init = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], options?: Options<Matrix4>) =>
    S.SerializedClass(
      () => new Matrix4().fromArray(init),
      {
        elements: S.Array(S.Number(), undefined, {
          maxItems: 16,
          minItems: 16
        })
      },
      {
        initializer: (curr, value) => curr.copy(value),
        ...options,
        id: 'Mat4'
      }
    ),

  /**
   *
   * Schema representing a color
   * Can be a Color object, string or number, but will always serialize as a number
   *
   * @param init default color representation
   * @param options schema options
   * @returns
   */
  Color: (init?: ColorRepresentation, options?: Options<ColorRepresentation>) =>
    S.SerializedClass<TProperties, ColorRepresentation>(
      () => (isColorObj(init) ? new Color(init.r, init.g, init.b) : new Color(init)),
      {
        r: S.Number(),
        g: S.Number(),
        b: S.Number()
      },
      {
        initializer: (curr, value) => (curr instanceof Color ? curr.set(value) : new Color(value)),
        serializer: (value) => (value instanceof Color ? value.getHex() : new Color(value).getHex()),
        ...options,
        id: 'Color'
      }
    ),

  /**
   *
   * Creates a schema object that infers to the generic type provided
   * Only the properties that are passed in on the props object will be serialized, if none are provided the value will not be serialized
   *
   * @param init the default value or function returning the default value, if it is a value it will go through a structuredClone so it must not be a non-cloneable value (ie. DOM Node)
   * @param props the properties you want to be serialized for the type
   * @param options schema options
   * @returns
   */
  Type: <T>(init?: T, props?: TProperties, options?: TTypedSchema<T>['options']) =>
    S.SerializedClass(init as () => any, props ?? {}, options ?? {}) as unknown as TTypedSchema<T>,

  /**
   * Create a schema object that infers as an any type, the value is serialized
   */
  Any: () =>
    ({
      [Kind]: 'Any'
    }) as TTypedSchema<any>
}
