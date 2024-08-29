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
  NumberOptions,
  ObjectOptions,
  SchemaOptions,
  StringOptions,
  TProperties,
  TSchema,
  Type
} from '@sinclair/typebox'
import { Quaternion } from 'three'
import { UndefinedEntity } from './Entity'

const buildOptions = (init: any | undefined, options?: SchemaOptions) => {
  return init !== undefined
    ? {
        default: init,
        ...options
      }
    : options
}

export const S = {
  Number: (init?: number, options?: NumberOptions) => Type.Number(buildOptions(init, options)),
  Bool: (init?: boolean, options?: SchemaOptions) => Type.Boolean(buildOptions(init, options)),
  String: (init?: string, options?: StringOptions) => Type.String(buildOptions(init, options)),
  Enum: <T extends Record<string, string | number>>(item: T, init?: string | number, options?: SchemaOptions) =>
    Type.Enum(item, buildOptions(init, options)),

  Object: <T extends TProperties, Initial>(properties: T, init?: Initial, options?: ObjectOptions) =>
    Type.Object(properties, buildOptions(init, options)),

  Array: <T extends TSchema, Initial extends any[]>(items: T, init?: Initial, options?: ArrayOptions) =>
    Type.Array(items, buildOptions(init, options)),

  // Newer version of TypeBox has an Extends function that would make this better
  Class: <T extends TProperties, Initial extends new (...params: any[]) => any>(
    items: T,
    init: Initial,
    options?: ObjectOptions,
    ...args: ConstructorParameters<Initial>
  ) => Type.Object(items, buildOptions(init, options)),

  Func: <T extends TSchema[], U extends TSchema>(parameters: [...T], returns: U, options?: SchemaOptions) =>
    Type.Function(parameters, returns, options),

  Call: (options?: SchemaOptions) => Type.Function([], Type.Void(), options)
}

const OpaqueTypeSchema = <T extends TSchema>(t: T) =>
  S.Object({
    __opaqueType: Type.Readonly(t)
  })

export const EntitySchema = Type.Intersect([OpaqueTypeSchema(Type.Literal('entity')), S.Number()], {
  default: UndefinedEntity
})

export const Vector3Schema = (options?: { x: NumberOptions; y: NumberOptions; z: NumberOptions }) =>
  S.Object(
    {
      x: S.Number(),
      y: S.Number(),
      z: S.Number()
    },
    {
      default: {
        x: options?.x?.default ?? 0,
        y: options?.y?.default ?? 0,
        z: options?.z?.default ?? 0
      },
      $id: 'Vector3'
    }
  )

export const QuaternionSchema = (options?: {
  x: NumberOptions
  y: NumberOptions
  z: NumberOptions
  w: NumberOptions
}) =>
  S.Object(
    {
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number(),
      w: Type.Number()
    },
    {
      default: new Quaternion(
        options?.x?.default ?? 0,
        options?.y?.default ?? 0,
        options?.z?.default ?? 0,
        options?.w?.default ?? 0
      )
    }
  )

export const Matrix4Schema = () =>
  Type.Object({
    elements: Type.Array(Type.Number(), {
      default: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      maxItems: 16,
      minItems: 16
    })
  })
