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
  Static,
  StringOptions,
  TProperties,
  TSchema,
  Type
} from '@sinclair/typebox'
import { Quaternion, Vector3 } from 'three'
import { UndefinedEntity } from './Entity'

const buildOptions = (init: any | undefined, options?: SchemaOptions) => {
  return init !== undefined
    ? {
        default: init,
        ...options
      }
    : options
}

export interface TTypedClass<T> extends TSchema {
  [Kind]: 'Object'
  static: T
  type: T
}

export const TypedClass = <T, TProps extends TProperties>(properties: TProps, init: () => T, options?: ObjectOptions) =>
  S.Object(properties, init, options) as unknown as TTypedClass<T>

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

  Class: <T extends TProperties, Initial extends new (...params: any[]) => any>(
    init: Initial,
    items: T,
    ...args: ConstructorParameters<Initial>
  ) => TypedClass<InstanceType<Initial>, T>(items, () => new init(...args)),

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

export const Vec3Schema = (init = { x: 0, y: 0, z: 0 }, options?: ObjectOptions) =>
  TypedClass<Vector3, TProperties>(
    {
      x: S.Number(),
      y: S.Number(),
      z: S.Number()
    },
    () => new Vector3(init.x, init.y, init.z),
    {
      ...options,
      $id: 'Vector3'
    }
  )

export const Vec3SchemaToVec3 = (vec3: Static<ReturnType<typeof Vec3Schema>>) => new Vector3(vec3.x, vec3.y, vec3.z)

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
