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
  Null: (options?: Options) =>
    ({
      [Kind]: 'Null',
      options: options
    }) as TNullSchema,

  Undefined: (options?: Options) =>
    ({
      [Kind]: 'Undefined',
      options: options
    }) as TUndefinedSchema,

  Void: (options?: Options) =>
    ({
      [Kind]: 'Void',
      options: options
    }) as TVoidSchema,

  Number: (init?: number, options?: TNumberSchema['options']) =>
    ({
      [Kind]: 'Number',
      options: buildOptions(init ?? 0, options)
    }) as TNumberSchema,

  Bool: (init?: boolean, options?: Options) =>
    ({
      [Kind]: 'Bool',
      options: buildOptions(init ?? false, options)
    }) as TBoolSchema,

  String: (init?: string, options?: Options) =>
    ({
      [Kind]: 'String',
      options: buildOptions(init ?? '', options)
    }) as TStringSchema,

  Enum: <T extends Record<string, string | number>>(item: T, init?: string | number, options?: Options) =>
    ({
      [Kind]: 'Enum',
      options: buildOptions(init, options),
      properties: item
    }) as TEnumSchema<T>,

  Literal: <T extends TLiteralValue>(item: T, init?: T, options?: Options) =>
    ({
      [Kind]: 'Literal',
      options: buildOptions(init, options),
      properties: item
    }) as TLiteralSchema<T>,

  Object: <T extends TProperties, Initial>(properties: T, init?: Initial, options?: Options) =>
    ({
      [Kind]: 'Object',
      options: buildOptions(init, options),
      properties: properties
    }) as TObjectSchema<T>,

  Record: <K extends Schema, V extends Schema, Initial>(key: K, value: V, init?: Initial, options?: Options) =>
    ({
      [Kind]: 'Record',
      options: buildOptions(init, options),
      properties: { key, value }
    }) as TRecordSchema<K, V>,

  Partial: <T extends Schema, Initial>(item: T, init?: Initial, options?: Options) =>
    ({
      [Kind]: 'Partial',
      options: buildOptions(init, options),
      properties: item
    }) as TPartialSchema<T>,

  Array: <T extends Schema, Initial extends any[]>(item: T, init?: Initial, options?: TArraySchema<T>['options']) =>
    ({
      [Kind]: 'Array',
      options: buildOptions(init ?? [], options),
      properties: item
    }) as TArraySchema<T>,

  Union: <T extends Schema[], Initial>(schemas: [...T], init?: Initial, options?: Options) =>
    ({
      [Kind]: 'Union',
      options: buildOptions(init, options),
      properties: schemas
    }) as TUnionSchema<T>,

  LiteralUnion: <T extends TLiteralValue>(items: T[], init?: T, options?: Options) =>
    S.Union([...items.map((lit) => S.Literal(lit))], init, options),

  Class: <T extends TProperties, Class>(init: () => Class) =>
    ({
      [Kind]: 'Class',
      options: {
        default: init
      },
      properties: {}
    }) as TClassSchema<T, Class>,

  SerializedClass: <T extends TProperties, Class>(
    init: () => Class,
    items: T,
    options: Options,
    serializer?: (value: Class) => any
  ) =>
    ({
      [Kind]: 'Class',
      options: {
        ...options,
        default: init
      },
      properties: items,
      serializer: serializer
    }) as TClassSchema<T, Class>,

  Func: <Params extends Schema[], Return extends Schema, Initial extends (...params: any[]) => any>(
    parameters: [...Params],
    returns: Return,
    init?: Initial,
    options?: Options
  ) =>
    ({
      [Kind]: 'Func',
      options: buildOptions(init, options),
      properties: { params: parameters, return: returns }
    }) as TFuncSchema<Params, Return>,

  Call: <Initial extends (...params: any[]) => any>(init?: Initial, options?: Options) =>
    S.Func([], S.Void(), init, options),

  Nullable: <T extends Schema, Initial>(schema: T, init?: Initial, options?: Options) =>
    S.Union([schema, S.Null()], init ?? null, options),

  Optional: <T extends Schema, Initial>(schema: T, init?: Initial, options?: Options) =>
    S.Union([schema, S.Undefined()], init ?? null, options),

  Required: <T extends Schema, Initial>(schema: T, init?: Initial, options?: Options) =>
    ({
      [Kind]: 'Required',
      options: buildOptions(init, options),
      properties: schema
    }) as TRequiredSchema<T>,

  NonSerialized: <T extends Schema, Initial>(schema: T, init?: Initial, options?: Options) =>
    ({
      [Kind]: 'NonSerialized',
      options: buildOptions(init, options),
      properties: schema
    }) as TNonSerializedSchema<T>,

  Entity: (def?: Entity) => S.Number(def ?? UndefinedEntity, { $id: 'Entity' }) as unknown as TTypedSchema<Entity>,

  EntityUUID: () => S.String('', { $id: 'EntityUUID' }) as unknown as TTypedSchema<EntityUUID>,

  UserID: () => S.String('', { $id: 'UserUUID' }) as unknown as TTypedSchema<UserID>,

  Vec3: (init = { x: 0, y: 0, z: 0 }, options?: Options) =>
    S.SerializedClass(
      () => new Vector3(init.x, init.y, init.z),
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number()
      },
      {
        ...options,
        id: 'Vec3'
      }
    ),

  Vec2: (init = { x: 0, y: 0 }, options?: Options) =>
    S.SerializedClass(
      () => new Vector2(init.x, init.y),
      {
        x: S.Number(),
        y: S.Number()
      },
      {
        ...options,
        id: 'Vec2'
      }
    ),

  Quaternion: (init = { x: 0, y: 0, z: 0, w: 1 }, options?: Options) =>
    S.SerializedClass(
      () => new Quaternion(init.x, init.y, init.z, init.w),
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number(),
        w: S.Number()
      },
      {
        ...options,
        id: 'Quaternion'
      }
    ),

  Mat4: (init = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], options?: Options) =>
    S.SerializedClass(
      () => new Matrix4().fromArray(init),
      {
        elements: S.Array(S.Number(), undefined, {
          maxItems: 16,
          minItems: 16
        })
      },
      {
        ...options,
        id: 'Mat4'
      }
    ),

  Color: (init?: ColorRepresentation, options?: Options) =>
    S.SerializedClass<TProperties, ColorRepresentation>(
      () => (isColorObj(init) ? new Color(init.r, init.g, init.b) : new Color(init)),
      {
        r: S.Number(),
        g: S.Number(),
        b: S.Number()
      },
      {
        ...options,
        id: 'Color'
      },
      (value) => (value instanceof Color ? value.getHex() : new Color(value).getHex())
    ),

  // Only use if you have to (ie. HTML element types, Three types), provides no real type safety or auto serialization
  Type: <T>(init?: T, props?: TProperties, options?: Options) =>
    S.SerializedClass(init as () => any, props ?? {}, options ?? {}) as unknown as TTypedSchema<T>,

  Any: () =>
    ({
      [Kind]: 'Any'
    }) as TTypedSchema<any>
}

export const XRHandedness = S.LiteralUnion(['none', 'left', 'right'], 'none')
