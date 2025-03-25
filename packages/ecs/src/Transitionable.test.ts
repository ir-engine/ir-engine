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
import { describe, expect, it } from 'vitest'
import { Transitionable, getTransitionableKeyForType } from './Transitionable'

describe('Transitionable', () => {
  describe('number', () => {
    it('should interpolate numbers correctly', () => {
      const result = Transitionable.number.interpolate(0, 10, 0.5)
      expect(result).toBe(5)
    })

    it('should identify numbers correctly', () => {
      expect(Transitionable.number.isType(42)).toBe(true)
      expect(Transitionable.number.isType('42')).toBe(false)
    })
  })

  describe('vector2', () => {
    it('should interpolate Vector2 correctly', () => {
      const v1 = new Vector2(0, 0)
      const v2 = new Vector2(10, 20)
      const result = Transitionable.vector2.interpolate(v1, v2, 0.5)
      expect(result.x).toBe(5)
      expect(result.y).toBe(10)
    })

    it('should identify Vector2 correctly', () => {
      expect(Transitionable.vector2.isType(new Vector2())).toBe(true)
      expect(Transitionable.vector2.isType(new Vector3())).toBe(false)
    })
  })

  describe('vector3', () => {
    it('should interpolate Vector3 correctly', () => {
      const v1 = new Vector3(0, 0, 0)
      const v2 = new Vector3(10, 20, 30)
      const result = Transitionable.vector3.interpolate(v1, v2, 0.5)
      expect(result.x).toBe(5)
      expect(result.y).toBe(10)
      expect(result.z).toBe(15)
    })

    it('should identify Vector3 correctly', () => {
      expect(Transitionable.vector3.isType(new Vector3())).toBe(true)
      expect(Transitionable.vector3.isType(new Vector2())).toBe(false)
    })
  })

  describe('quaternion', () => {
    it('should interpolate Quaternion correctly', () => {
      const q1 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0)
      const q2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)
      const result = Transitionable.quaternion.interpolate(q1, q2, 0.5)
      expect(result.angleTo(q1)).toBeCloseTo(Math.PI / 2, 4)
      expect(result.angleTo(q2)).toBeCloseTo(Math.PI / 2, 4)
    })

    it('should identify Quaternion correctly', () => {
      expect(Transitionable.quaternion.isType(new Quaternion())).toBe(true)
      expect(Transitionable.quaternion.isType(new Vector3())).toBe(false)
    })
  })

  describe('color', () => {
    it('should interpolate Color correctly', () => {
      const c1 = new Color(0, 0, 0)
      const c2 = new Color(1, 1, 1)
      const result = Transitionable.color.interpolate(c1, c2, 0.5)
      expect(result.r).toBeCloseTo(0.5)
      expect(result.g).toBeCloseTo(0.5)
      expect(result.b).toBeCloseTo(0.5)
    })

    it('should identify Color correctly', () => {
      expect(Transitionable.color.isType(new Color())).toBe(true)
      expect(Transitionable.color.isType(new Vector3())).toBe(false)
    })
  })

  describe('getTransitionableKeyForType', () => {
    it('should return correct key for each type', () => {
      expect(getTransitionableKeyForType(42)).toBe('number')
      expect(getTransitionableKeyForType(new Vector2())).toBe('vector2')
      expect(getTransitionableKeyForType(new Vector3())).toBe('vector3')
      expect(getTransitionableKeyForType(new Quaternion())).toBe('quaternion')
      expect(getTransitionableKeyForType(new Color())).toBe('color')
    })

    it('should return undefined for non-transitionable types', () => {
      expect(getTransitionableKeyForType('string' as any)).toBeUndefined()
      expect(getTransitionableKeyForType({} as any)).toBeUndefined()
    })
  })
})
