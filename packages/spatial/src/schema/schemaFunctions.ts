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

import { Box3, Color, ColorRepresentation, Matrix4, Quaternion, Vector2, Vector3 } from 'three'

import { Options, TProperties } from '@ir-engine/ecs/src/schemas/JSONSchemaTypes'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

const isColorObj = (color?: ColorRepresentation): color is Color => {
  return color !== undefined && (color as Color).r !== undefined
}

export const NonEmptyString = (errMsg: string) => {
  return (str: string): boolean => {
    if (!str) {
      console.error(errMsg)
      return false
    }

    return true
  }
}

export const T = {
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
        deserialize: (curr, value) => curr.copy(value),
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
        deserialize: (curr, value) => curr.copy(value),
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
        deserialize: (curr, value) => curr.copy(value),
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
        deserialize: (curr, value) => curr.copy(value),
        ...options,
        id: 'Mat4'
      }
    ),

  /** Vector3 type schema helper, defaults to { x: 0, y: 0, z: 0 } */
  Box3: (init?: Box3, options?: Options<Box3>) =>
    S.SerializedClass(
      () => new Box3(init?.min, init?.max),
      {
        min: T.Vec3(),
        max: T.Vec3()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        ...options,
        id: 'Box3'
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
        deserialize: (curr, value) => (curr instanceof Color ? curr.set(value) : new Color(value)),
        serialize: (value) => (value instanceof Color ? value.getHex() : new Color(value).getHex()),
        ...options,
        id: 'Color'
      }
    )
}
