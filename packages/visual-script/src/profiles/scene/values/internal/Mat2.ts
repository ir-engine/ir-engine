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

import { EPSILON, equalsTolerance, parseSafeFloats, toSafeString } from '../../../../VisualScriptModule'
import { Mat3 } from './Mat3'
import { Mat4 } from './Mat4'
import { Vec2 } from './Vec2'

// uses OpenGL matrix layout where each column is specified subsequently in order from left to right.
// ( x, y ) x [ 0  2 ] = ( x', y' )
//            [ 1  3 ]

const NUM_ROWS = 2
const NUM_COLUMNS = 2
const NUM_ELEMENTS = NUM_ROWS * NUM_COLUMNS

export type Mat2JSON = number[]

export class Mat2 {
  constructor(public elements: number[] = [1, 0, 0, 1]) {
    if (elements.length !== NUM_ELEMENTS) {
      throw new Error(`elements must have length ${NUM_ELEMENTS}, got ${elements.length}`)
    }
  }

  clone(result = new Mat2()): Mat2 {
    return result.set(this.elements)
  }
  set(elements: number[]): this {
    if (elements.length !== NUM_ELEMENTS) {
      throw new Error(`elements must have length ${NUM_ELEMENTS}, got ${elements.length}`)
    }
    for (let i = 0; i < NUM_ELEMENTS; i++) {
      this.elements[i] = elements[i]
    }
    return this
  }
}

export function mat2SetColumn3(m: Mat2, columnIndex: number, column: Vec2, result = new Mat2()): Mat2 {
  const re = result.set(m.elements).elements
  const base = columnIndex * NUM_ROWS
  re[base + 0] = column.x
  re[base + 1] = column.y
  return result
}

export function mat2SetRow3(m: Mat2, rowIndex: number, row: Vec2, result = new Mat2()): Mat2 {
  const re = result.set(m.elements).elements
  re[rowIndex + NUM_COLUMNS * 0] = row.x
  re[rowIndex + NUM_COLUMNS * 1] = row.y
  return result
}

export function column3ToMat2(a: Vec2, b: Vec2, c: Vec2, result = new Mat2()): Mat2 {
  const re = result.elements
  const columns = [a, b, c]
  for (let c = 0; c < columns.length; c++) {
    const base = c * NUM_ROWS
    const column = columns[c]
    re[base + 0] = column.x
    re[base + 1] = column.y
  }
  return result
}

export function mat2Equals(a: Mat2, b: Mat2, tolerance = EPSILON): boolean {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    if (!equalsTolerance(a.elements[i], b.elements[i], tolerance)) return false
  }
  return true
}
export function mat2Add(a: Mat2, b: Mat2, result: Mat2 = new Mat2()): Mat2 {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    result.elements[i] = a.elements[i] + b.elements[i]
  }
  return result
}
export function mat2Subtract(a: Mat2, b: Mat2, result: Mat2 = new Mat2()): Mat2 {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    result.elements[i] = a.elements[i] - b.elements[i]
  }
  return result
}
export function mat2MultiplyByScalar(a: Mat2, b: number, result: Mat2 = new Mat2()): Mat2 {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    result.elements[i] = a.elements[i] * b
  }
  return result
}
export function mat2Negate(a: Mat2, result: Mat2 = new Mat2()): Mat2 {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    result.elements[i] = -a.elements[i]
  }
  return result
}

export function mat2Multiply(a: Mat2, b: Mat2, result = new Mat2()): Mat2 {
  throw new Error('not implemented')
}

export function mat2Determinant(m: Mat2): number {
  throw new Error('not implemented')
}

export function mat2Transpose(m: Mat2, result = new Mat2()): Mat2 {
  const me = m.elements
  const te = result.elements

  te[0] = me[0]
  te[1] = me[2]
  te[2] = me[1]
  te[3] = me[3]

  return result
}

export function mat2Inverse(m: Mat2, result = new Mat2()): Mat2 {
  throw new Error('not implemented')
}

export function mat2Mix(a: Mat2, b: Mat2, t: number, result = new Mat2()): Mat2 {
  const s = 1 - t
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    result.elements[i] = a.elements[i] * s + b.elements[i] * t
  }
  return result
}
export function mat2FromArray(array: Float32Array | number[], offset = 0, result: Mat2 = new Mat2()): Mat2 {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    result.elements[i] = array[offset + i]
  }
  return result
}
export function mat2ToArray(a: Mat2, array: Float32Array | number[], offset = 0): void {
  for (let i = 0; i < NUM_ELEMENTS; i++) {
    array[offset + i] = a.elements[i]
  }
}

export function mat2ToString(a: Mat2): string {
  return toSafeString(a.elements)
}
export function mat2Parse(text: string, result = new Mat2()): Mat2 {
  return mat2FromArray(parseSafeFloats(text), 0, result)
}

export function scale2ToMat2(s: Vec2, result = new Mat2()): Mat2 {
  return result.set([s.x, 0, 0, s.y])
}
// from gl-matrix
export function mat2ToScale2(m: Mat4, result = new Vec2()): Vec2 {
  const mat = m.elements
  const m11 = mat[0]
  const m12 = mat[1]
  const m21 = mat[2]
  const m22 = mat[3]

  return result.set(Math.sqrt(m11 * m11 + m12 * m12), Math.sqrt(m21 * m21 + m22 * m22))
}

export function mat3ToMat2(a: Mat3, result = new Mat2()): Mat2 {
  const ae = a.elements
  return result.set([ae[0], ae[1], ae[3], ae[4]])
}
