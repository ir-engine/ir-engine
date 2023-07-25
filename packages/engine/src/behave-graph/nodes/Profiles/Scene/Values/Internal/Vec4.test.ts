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
  Vec4,
  vec4Add,
  vec4Dot,
  vec4FromArray,
  vec4Length,
  vec4MultiplyByScalar,
  vec4Negate,
  vec4Normalize,
  vec4Parse,
  vec4Subtract,
  vec4ToArray,
  vec4ToString
} from './Vec4.js'

describe('vec4 value type', () => {
  test('constructor', () => {
    const value = new Vec4(1, 2, 3, 4)
    expect(value.x).toEqual(1)
    expect(value.y).toEqual(2)
    expect(value.z).toEqual(3)
    expect(value.w).toEqual(4)
  })
  test('add', () => {
    const value = vec4Add(new Vec4(1, 2, 3, 4), new Vec4(3, 4, 5, 6))
    expect(value.x).toEqual(4)
    expect(value.y).toEqual(6)
    expect(value.z).toEqual(8)
    expect(value.w).toEqual(10)
  })
  test('subtract', () => {
    const value = vec4Subtract(new Vec4(1, 2, 3, 4), new Vec4(3, 8, 13, 18))
    expect(value.x).toEqual(-2)
    expect(value.y).toEqual(-6)
    expect(value.z).toEqual(-10)
    expect(value.w).toEqual(-14)
  })
  test('scale', () => {
    const value = vec4MultiplyByScalar(new Vec4(1, 2, 3, 4), 2)
    expect(value.x).toEqual(2)
    expect(value.y).toEqual(4)
    expect(value.z).toEqual(6)
    expect(value.w).toEqual(8)
  })
  test('negate', () => {
    const value = vec4Negate(new Vec4(1, 2, 3, 4))
    expect(value.x).toEqual(-1)
    expect(value.y).toEqual(-2)
    expect(value.z).toEqual(-3)
    expect(value.w).toEqual(-4)
  })
  test('length', () => {
    const value = vec4Length(new Vec4(1, 2, 3, 4))
    expect(value).toEqual(Math.sqrt(1 + 2 * 2 + 3 * 3 + 4 * 4))
  })
  test('normalize', () => {
    const value = vec4Normalize(new Vec4(0, 0, 0, 2))
    expect(value.x).toEqual(0)
    expect(value.y).toEqual(0)
    expect(value.z).toEqual(0)
    expect(value.w).toEqual(1)
  })
  test('dot', () => {
    const value = vec4Dot(new Vec4(0, 2, 1, 3), new Vec4(3, 4, 1, 1))
    expect(value).toEqual(12)
  })
  test('fromArray', () => {
    const value = vec4FromArray([1, 2, 3, 4, 5], 1)
    expect(value.x).toEqual(2)
    expect(value.y).toEqual(3)
    expect(value.z).toEqual(4)
    expect(value.w).toEqual(5)
  })
  test('fromArray', () => {
    const array = [1, 2, 3]
    vec4ToArray(new Vec4(6, 7, 8, 9), array, 1)
    expect(array[1]).toEqual(6)
    expect(array[2]).toEqual(7)
    expect(array[3]).toEqual(8)
    expect(array[4]).toEqual(9)
  })
  test('toString/parser', () => {
    const v = new Vec4(10, 5.5, -9, 99999)
    const text = vec4ToString(v)
    const v2 = vec4Parse(text)
    expect(v.x).toEqual(v2.x)
    expect(v.y).toEqual(v2.y)
    expect(v.z).toEqual(v2.z)
  })
})
