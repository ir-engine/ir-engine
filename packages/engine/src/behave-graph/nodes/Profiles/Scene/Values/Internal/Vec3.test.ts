/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  Vec3,
  vec3Add,
  vec3Dot,
  vec3FromArray,
  vec3Length,
  vec3MultiplyByScalar,
  vec3Negate,
  vec3Normalize,
  vec3Parse,
  vec3Subtract,
  vec3ToArray,
  vec3ToString
} from './Vec3.js'

describe('vec3 value type', () => {
  test('constructor', () => {
    const value = new Vec3(1, 2, 3)
    expect(value.x).toEqual(1)
    expect(value.y).toEqual(2)
    expect(value.z).toEqual(3)
  })
  test('add', () => {
    const value = vec3Add(new Vec3(1, 2, 3), new Vec3(3, 4, 5))
    expect(value.x).toEqual(4)
    expect(value.y).toEqual(6)
    expect(value.z).toEqual(8)
  })
  test('subtract', () => {
    const value = vec3Subtract(new Vec3(1, 2, 3), new Vec3(3, 8, 13))
    expect(value.x).toEqual(-2)
    expect(value.y).toEqual(-6)
    expect(value.z).toEqual(-10)
  })
  test('scale', () => {
    const value = vec3MultiplyByScalar(new Vec3(1, 2, 3), 2)
    expect(value.x).toEqual(2)
    expect(value.y).toEqual(4)
    expect(value.z).toEqual(6)
  })
  test('negate', () => {
    const value = vec3Negate(new Vec3(1, 2, 3))
    expect(value.x).toEqual(-1)
    expect(value.y).toEqual(-2)
    expect(value.z).toEqual(-3)
  })
  test('length', () => {
    const value = vec3Length(new Vec3(1, 2, 3))
    expect(value).toEqual(Math.sqrt(1 + 2 * 2 + 3 * 3))
  })
  test('normalize', () => {
    const value = vec3Normalize(new Vec3(0, 0, 2))
    expect(value.x).toEqual(0)
    expect(value.y).toEqual(0)
    expect(value.z).toEqual(1)
  })
  test('dot', () => {
    const value = vec3Dot(new Vec3(0, 2, 1), new Vec3(3, 4, 1))
    expect(value).toEqual(9)
  })
  test('fromArray', () => {
    const value = vec3FromArray([1, 2, 3, 4], 1)
    expect(value.x).toEqual(2)
    expect(value.y).toEqual(3)
    expect(value.z).toEqual(4)
  })
  test('fromArray', () => {
    const array = [1, 2, 3]
    vec3ToArray(new Vec3(6, 7, 8), array, 1)
    expect(array[1]).toEqual(6)
    expect(array[2]).toEqual(7)
    expect(array[3]).toEqual(8)
  })
  test('toString/parser', () => {
    const v = new Vec3(10, 5.5, -9)
    const text = vec3ToString(v)
    const v2 = vec3Parse(text)
    expect(v.x).toEqual(v2.x)
    expect(v.y).toEqual(v2.y)
    expect(v.z).toEqual(v2.z)
  })
})
