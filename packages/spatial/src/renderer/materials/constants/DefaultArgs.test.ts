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

import assert from 'assert'
import { Color, Texture } from 'three'
import {
  BoolArg,
  ColorArg,
  EulerArg,
  FloatArg,
  StringArg,
  TextureArg,
  Vec2Arg,
  Vec3Arg,
  Vec4Arg,
  generateDefaults,
  getDefaultType
} from './DefaultArgs'

describe('getDefaultType', () => {
  it("should return 'boolean' when `@param value` is a boolean type", () => {
    const Expected = BoolArg.type
    const value = true
    assert.equal(typeof value, 'boolean')
    const result = getDefaultType(value)
    assert.equal(result, Expected)
  })

  it("should return 'string' when `@param value` is a string type", () => {
    const Expected = StringArg.type
    const value = 'someValue'
    assert.equal(typeof value, 'string')
    const result = getDefaultType(value)
    assert.equal(result, Expected)
  })

  it("should return 'float' when `@param value` is a number type", () => {
    const Expected = FloatArg.type
    const value = 0.1234
    assert.equal(typeof value, 'number')
    const result = getDefaultType(value)
    assert.equal(result, Expected)
  })

  describe('when `@param value` is an object type ...', () => {
    it("... should return '' if [value.isTexture, value.isColor, value.isVector3, value.isVector2, value.isEuler, value.isQuaternion, value.isVector4, ] are all false or falsy", () => {
      const Expected = ''
      const value = {
        isTexture: false,
        isColor: false,
        isVector3: false,
        isVector2: undefined, // undefined is falsy
        isEuler: 0, // 0 is falsy
        isQuaternion: null // null is falsy
        // isVector4: false,   // Not defined is falsy
      }
      for (const [_, val] of Object.entries(value)) assert.equal(Boolean(val), false)
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'texture' if value.isTexture is true", () => {
      const Expected = TextureArg.type
      const value = { isTexture: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'color' if value.isColor is true", () => {
      const Expected = ColorArg.type
      const value = { isColor: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'vec3' if value.isVector3 is true", () => {
      const Expected = Vec3Arg.type
      const value = { isVector3: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'vec2' if value.isVector2 is true", () => {
      const Expected = Vec2Arg.type
      const value = { isVector2: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'euler' if value.isEuler is true", () => {
      const Expected = EulerArg.type
      const value = { isEuler: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'vec4' if value.isQuaternion is true", () => {
      const Expected = Vec4Arg.type
      const value = { isQuaternion: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })

    it("... should return 'vec4' if value.isVector4 is true", () => {
      const Expected = Vec4Arg.type
      const value = { isVector4: true }
      const result = getDefaultType(value)
      assert.equal(result, Expected)
    })
  })

  it("should return '' when `@param value`'s type is not one of [boolean, string, number, object]", () => {
    const Expected = ''
    const value = undefined
    const Valid = ['boolean', 'string', 'number', 'object']
    assert.equal(Valid.includes(typeof value), false)
    const result = getDefaultType(value)
    assert.equal(result, Expected)
  })
})

describe('generateDefaults', () => {
  it('should generate an object with the expected shape and values', () => {
    const bool = { key: 'bool', val: false, type: BoolArg.type }
    const str = { key: 'str', val: 'someString', type: StringArg.type }
    const num = { key: 'num', val: 0.1234, type: FloatArg.type }
    const texture = { key: 'texture', val: { isTexture: true } as Texture, type: TextureArg.type }
    const color = { key: 'color', val: { isColor: true } as Color, type: ColorArg.type }
    const vector3 = { key: 'vector3', val: { isVector3: true }, type: Vec3Arg.type }
    const vector2 = { key: 'vector2', val: { isVector2: true }, type: Vec2Arg.type }
    const euler = { key: 'euler', val: { isEuler: true }, type: EulerArg.type }
    const quaternion = { key: 'quaternion', val: { isQuaternion: true }, type: Vec4Arg.type }
    const vector4 = { key: 'vector4', val: { isVector4: true }, type: Vec4Arg.type }
    const Expected = {
      [bool.key]: { type: bool.type, default: bool.val },
      [str.key]: { type: str.type, default: str.val },
      [num.key]: { type: num.type, default: num.val },
      [texture.key]: { type: texture.type, default: texture.val },
      [color.key]: { type: color.type, default: color.val },
      [vector3.key]: { type: vector3.type, default: vector3.val },
      [vector2.key]: { type: vector2.type, default: vector2.val },
      [euler.key]: { type: euler.type, default: euler.val },
      [quaternion.key]: { type: quaternion.type, default: quaternion.val },
      [vector4.key]: { type: vector4.type, default: vector4.val }
    } //:: Expected
    const values = {
      [bool.key]: bool.val,
      [str.key]: str.val,
      [num.key]: num.val,
      [texture.key]: texture.val,
      [color.key]: color.val,
      [vector3.key]: vector3.val,
      [vector2.key]: vector2.val,
      [euler.key]: euler.val,
      [quaternion.key]: quaternion.val,
      [vector4.key]: vector4.val
    } //:: values
    const skip = {
      // Should not show up on the final object
      skip1: { someNumber: 1234 },
      skip2: { isTexture: false },
      skip3: { isColor: false },
      skip4: { isVector3: false },
      skip5: { isVector2: undefined }, // undefined is falsy
      skip6: { isEuler: 0 }, // 0 is falsy
      skip7: { isQuaternion: null }, // null is falsy
      skip8: {
        /* isVector4: false, */
      } // Not defined is falsy
    } //:: skip
    const value = { ...values, ...skip }
    const result = generateDefaults(value)
    assert.deepEqual(result, Expected)
  })
})
