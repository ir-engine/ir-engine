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
import {
  ArrayOptions,
  Kind,
  NumberOptions,
  ObjectOptions,
  SchemaOptions,
  StringOptions,
  TLiteralValue,
  TProperties,
  TSchema,
  Type
} from '@sinclair/typebox'
import { Types } from 'bitecs'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { Entity, EntityUUID, UndefinedEntity } from './Entity'

const buildOptions = (init: any | undefined, options?: SchemaOptions) => {
  return init !== undefined
    ? {
        default: init,
        ...options
      }
    : options
}

export interface TTypedSchema<T> extends TSchema {
  [Kind]: 'Object'
  static: T
  type: T
}

export const TypedClass = <T, TProps extends TProperties>(properties: TProps, init: () => T, options?: ObjectOptions) =>
  S.Object(properties, init, options) as unknown as TTypedSchema<T>

const EntitySchema = (def?: Entity) =>
  Type.Number({ default: def ?? UndefinedEntity, $id: 'Entity' }) as unknown as TTypedSchema<Entity>

const EntityUUIDSchema = () => Type.String({ default: '', $id: 'EntityUUID' }) as unknown as TTypedSchema<EntityUUID>

export const S = {
  Number: (init?: number, options?: NumberOptions) => Type.Number(buildOptions(init, options)),
  Bool: (init?: boolean, options?: SchemaOptions) => Type.Boolean(buildOptions(init, options)),
  String: (init?: string, options?: StringOptions) => Type.String(buildOptions(init, options)),
  Enum: <T extends Record<string, string | number>>(item: T, init?: string | number, options?: SchemaOptions) =>
    Type.Enum(item, buildOptions(init, options)),
  Literal: <T extends TLiteralValue>(item: T, init?: T, options?: SchemaOptions) =>
    Type.Literal(item, buildOptions(init, options)),

  Object: <T extends TProperties, Initial>(properties: T, init?: Initial, options?: ObjectOptions) =>
    Type.Object(properties, buildOptions(init, options)),

  Record: <K extends TSchema, V extends TSchema, Initial>(key: K, value: V, init?: Initial, options?: ObjectOptions) =>
    Type.Record(key, value, buildOptions(init, options)),

  Array: <T extends TSchema, Initial extends any[]>(items: T, init?: Initial, options?: ArrayOptions) =>
    Type.Array(items, buildOptions(init ?? [], options)),

  Union: <T extends TSchema[], Initial>(schemas: [...T], init?: Initial, options?: SchemaOptions) =>
    Type.Union(schemas, buildOptions(init, options)),

  LiteralUnion: <T extends TLiteralValue>(items: T[], init?: T, options?: SchemaOptions) =>
    S.Union([...items.map((lit) => S.Literal(lit))], buildOptions(init, options)),

  Class: <T extends TProperties, Initial extends new (...params: any[]) => any>(
    init: Initial,
    items: T,
    ...args: ConstructorParameters<Initial>
  ) => TypedClass<InstanceType<Initial>, T>(items, () => new init(...args)),

  Func: <T extends TSchema[], U extends TSchema>(parameters: [...T], returns: U, options?: SchemaOptions) =>
    Type.Function(parameters, returns, options),

  Nullable: <T extends TSchema, Initial>(schema: T, init?: Initial, options?: SchemaOptions) =>
    S.Union([schema, Type.Null()], buildOptions(init, options)),

  Optional: <T extends TSchema, Initial>(schema: T, init?: Initial, options?: SchemaOptions) =>
    S.Union([schema, Type.Undefined()], buildOptions(init, options)),

  Call: (options?: SchemaOptions) => Type.Function([], Type.Void(), options),

  Entity: (def?: Entity) => EntitySchema(),

  EntityUUID: () => EntityUUIDSchema(),

  Vec3: (init = { x: 0, y: 0, z: 0 }, options?: ObjectOptions) =>
    TypedClass<Vector3, TProperties>(
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number()
      },
      () => new Vector3(init.x, init.y, init.z),
      {
        ...options,
        $id: 'Vec3'
      }
    ),

  Quaternion: (init = { x: 0, y: 0, z: 0, w: 1 }, options?: ObjectOptions) =>
    TypedClass<Quaternion, TProperties>(
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number(),
        w: S.Number()
      },
      () => new Quaternion(init.x, init.y, init.z, init.w),
      {
        ...options,
        $id: 'Quaternion'
      }
    ),

  Mat4: (init = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], options?: ObjectOptions) =>
    TypedClass<Matrix4, TProperties>(
      {
        elements: Type.Array(Type.Number(), {
          maxItems: 16,
          minItems: 16
        })
      },
      () => new Matrix4().fromArray(init),
      {
        ...options,
        $id: 'Mat4'
      }
    ),

  // Only use if you have to (ie. HTML element types, Three types), provides no real type safety
  Type: <T>(options?: ObjectOptions) => S.Object({}, buildOptions(null, options)) as unknown as TTypedSchema<T>,

  Any: () => Type.Any()
}

export const XRHandedness = S.LiteralUnion(['none', 'left', 'right'], 'none')

const { f64 } = Types
export const ECSSchema = {
  Vec3: { x: f64, y: f64, z: f64 },
  Quaternion: { x: f64, y: f64, z: f64, w: f64 },
  Mat4: [f64, 16] as const
}
