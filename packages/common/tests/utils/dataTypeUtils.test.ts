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
import { describe, expect, it } from 'vitest'
import { getDataType, parseValue } from '../../src/utils/dataTypeUtils'

describe('getDataType', () => {
  it('should return "string" for string values', () => {
    expect(getDataType('string value')).toBe('string')
    expect(getDataType('abc123')).toBe('string')
  })

  it('should return "boolean" for boolean values', () => {
    expect(getDataType(true)).toBe('boolean')
    expect(getDataType(false)).toBe('boolean')
    expect(getDataType('true')).toBe('boolean')
    expect(getDataType('false')).toBe('boolean')
  })

  it('should return "integer" for integer values', () => {
    expect(getDataType(123)).toBe('integer')
    expect(getDataType('123')).toBe('integer')
  })
})

describe('parseValue', () => {
  it('should parse string values correctly', () => {
    expect(parseValue('hello', 'string')).toBe('hello')
    expect(parseValue('123', 'string')).toBe('123')
  })

  it('should parse boolean values correctly', () => {
    expect(parseValue('true', 'boolean')).toBe(true)
    expect(parseValue('false', 'boolean')).toBe(false)
  })

  it('should parse integer values correctly', () => {
    expect(parseValue('123', 'integer')).toBe(123)
    expect(parseValue('0', 'integer')).toBe(0)
  })

  it('should return the original value for unknown data types', () => {
    expect(parseValue('hello', 'unknown' as any)).toBe('hello')
  })
})
