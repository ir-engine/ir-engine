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

import { Color, Quaternion, Vector2, Vector3 } from 'three'

const Q_IDENTITY = new Quaternion()

export const Transitionable = {
  number: {
    interpolate: (a: number, b: number, t: number) => a + (b - a) * t,
    isType: (a: any): a is number => typeof a === 'number'
  },
  vector2: {
    interpolate: (a: Vector2, b: Vector2, t: number, out?: Vector2) => {
      out = out || new Vector2()
      out.x = a.x + (b.x - a.x) * t
      out.y = a.y + (b.y - a.y) * t
      return out
    },
    isType: (a: any): a is Vector2 => a instanceof Vector2
  },
  vector3: {
    interpolate: (a: Vector3, b: Vector3, t: number, out?: Vector3) => {
      out = out || new Vector3()
      out.x = a.x + (b.x - a.x) * t
      out.y = a.y + (b.y - a.y) * t
      out.z = a.z + (b.z - a.z) * t
      return out
    },
    isType: (a: any): a is Vector3 => a instanceof Vector3
  },
  quaternion: {
    interpolate: (a: Quaternion, b: Quaternion, t: number, out?: Quaternion) => {
      out = out || new Quaternion()
      return out.slerpQuaternions(a, b, t)
    },
    isType: (a: any): a is Quaternion => a instanceof Quaternion
  },
  color: {
    interpolate: (a: Color, b: Color, t: number, out?: Color) => {
      out = out || new Color()
      out.lerpColors(a, b, t)
      return out
    },
    isType: (a: any): a is Color => a instanceof Color
  },
  colorHSL: {
    interpolate: (a: Color, b: Color, t: number, out?: Color) => {
      out = out || new Color()
      out.copy(a).lerpHSL(b, t)
      return out
    },
    isType: (a: any): a is Color => a instanceof Color
  }
} satisfies Record<string, Transitionable>

export type Transitionable = {
  interpolate(a: any, b: any, t: number, out?: any): any
  isType(a: any): boolean
}

// get all of the Transitionable types supported
export type TransitionableTypes = {
  [K in keyof typeof Transitionable]: (typeof Transitionable)[K] extends Transitionable
    ? (typeof Transitionable)[K] extends { isType: (a: any) => a is infer T }
      ? T
      : never
    : never
}[keyof typeof Transitionable]

export function getTransitionableKeyForType(type: TransitionableTypes) {
  return Object.entries(Transitionable).find(([key, value]) => value.isType(type))?.[0] as
    | keyof typeof Transitionable
    | undefined
}
