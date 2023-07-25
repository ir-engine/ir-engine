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
  Vec2,
  vec2Add,
  vec2Dot,
  vec2FromArray,
  vec2Length,
  vec2MultiplyByScalar,
  vec2Negate,
  vec2Normalize,
  vec2Parse,
  vec2Subtract,
  vec2ToArray,
  vec2ToString
} from './Vec2.js'

describe('vec2 value type', () => {
  test('constructor', () => {
    const value = new Vec2(1, 2)
    expect(value.x).toEqual(1)
    expect(value.y).toEqual(2)
  })
  test('add', () => {
    const value = vec2Add(new Vec2(1, 2), new Vec2(3, 4))
    expect(value.x).toEqual(4)
    expect(value.y).toEqual(6)
  })
  test('subtract', () => {
    const value = vec2Subtract(new Vec2(1, 2), new Vec2(3, 8))
    expect(value.x).toEqual(-2)
    expect(value.y).toEqual(-6)
  })
  test('scale', () => {
    const value = vec2MultiplyByScalar(new Vec2(1, 2), 2)
    expect(value.x).toEqual(2)
    expect(value.y).toEqual(4)
  })
  test('negate', () => {
    const value = vec2Negate(new Vec2(1, 2))
    expect(value.x).toEqual(-1)
    expect(value.y).toEqual(-2)
  })
  test('length', () => {
    const value = vec2Length(new Vec2(1, 2))
    expect(value).toEqual(Math.sqrt(1 + 2 * 2))
  })
  test('normalize', () => {
    const value = vec2Normalize(new Vec2(0, 2))
    expect(value.x).toEqual(0)
    expect(value.y).toEqual(1)
  })
  test('dot', () => {
    const value = vec2Dot(new Vec2(0, 2), new Vec2(3, 4))
    expect(value).toEqual(8)
  })
  test('fromArray', () => {
    const value = vec2FromArray([1, 2, 3], 1)
    expect(value.x).toEqual(2)
    expect(value.y).toEqual(3)
  })
  test('fromArray', () => {
    const array = [1, 2, 3]
    vec2ToArray(new Vec2(6, 7), array, 1)
    expect(array[1]).toEqual(6)
    expect(array[2]).toEqual(7)
  })
  test('toString/parser', () => {
    const v = new Vec2(10, 5.5)
    const text = vec2ToString(v)
    const v2 = vec2Parse(text)
    expect(v.x).toEqual(v2.x)
    expect(v.y).toEqual(v2.y)
  })
})
