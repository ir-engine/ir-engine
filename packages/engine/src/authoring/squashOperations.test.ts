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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Operation } from 'rfc6902'
import { describe, expect, it } from 'vitest'
import { squashOperations } from './squashOperations'

describe('squashOperations', () => {
  it('should return an empty array for empty input', () => {
    expect(squashOperations([])).toEqual([])
    expect(squashOperations(undefined as any)).toEqual([])
  })

  it('should handle a single operation', () => {
    const operations: Operation[] = [{ op: 'add', path: '/a', value: 1 }]
    expect(squashOperations(operations)).toEqual(operations)
  })

  it('should remove redundant add operations on the same path', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'add', path: '/a', value: 2 }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'add', path: '/a', value: 2 }])
  })

  it('should remove redundant replace operations on the same path', () => {
    const operations: Operation[] = [
      { op: 'replace', path: '/a', value: 1 },
      { op: 'replace', path: '/a', value: 2 }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'replace', path: '/a', value: 2 }])
  })

  it('should handle mixed add and replace operations on the same path', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'replace', path: '/a', value: 2 }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'replace', path: '/a', value: 2 }])
  })

  it('should cancel out add and remove operations on the same path', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'remove', path: '/a' }
    ]
    expect(squashOperations(operations)).toEqual([])
  })

  it('should cancel out replace and remove operations on the same path', () => {
    const operations: Operation[] = [
      { op: 'replace', path: '/a', value: 1 },
      { op: 'remove', path: '/a' }
    ]
    expect(squashOperations(operations)).toEqual([])
  })

  it('should handle remove followed by add on the same path', () => {
    const operations: Operation[] = [
      { op: 'remove', path: '/a' },
      { op: 'add', path: '/a', value: 1 }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'add', path: '/a', value: 1 }])
  })

  it('should remove operations on child paths when parent is removed', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a/b', value: 1 },
      { op: 'add', path: '/a/c', value: 2 },
      { op: 'remove', path: '/a' }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'remove', path: '/a' }])
  })

  it('should ignore operations on child paths after parent is removed', () => {
    const operations: Operation[] = [
      { op: 'remove', path: '/a' },
      { op: 'add', path: '/a/b', value: 1 }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'remove', path: '/a' }])
  })

  it('should handle move operations correctly', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'move', from: '/a', path: '/b' }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'add', path: '/b', value: 1 }])
  })

  it('should ignore move operations if source path is removed', () => {
    const operations: Operation[] = [
      { op: 'remove', path: '/a' },
      { op: 'move', from: '/a', path: '/b' }
    ]
    const result = squashOperations(operations)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual({ op: 'remove', path: '/a' })
  })

  it('should ignore move operations if destination path is under a removed path', () => {
    const operations: Operation[] = [
      { op: 'remove', path: '/b' },
      { op: 'move', from: '/a', path: '/b/c' }
    ]
    expect(squashOperations(operations)).toEqual([{ op: 'remove', path: '/b' }])
  })

  it('should handle copy operations correctly', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'copy', from: '/a', path: '/b' }
    ]
    expect(squashOperations(operations)).toEqual([
      { op: 'add', path: '/a', value: 1 },
      { op: 'copy', from: '/a', path: '/b' }
    ])
  })

  it('should ignore copy operations if source path is removed', () => {
    const operations: Operation[] = [
      { op: 'remove', path: '/a' },
      { op: 'copy', from: '/a', path: '/b' }
    ]
    const result = squashOperations(operations)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual({ op: 'remove', path: '/a' })
  })

  it('should preserve test operations', () => {
    const operations: Operation[] = [
      { op: 'test', path: '/a', value: 1 },
      { op: 'add', path: '/a', value: 1 }
    ]
    expect(squashOperations(operations)).toEqual([
      { op: 'test', path: '/a', value: 1 },
      { op: 'add', path: '/a', value: 1 }
    ])
  })

  it('should handle complex scenarios with multiple operations', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'add', path: '/b', value: 2 },
      { op: 'replace', path: '/a', value: 3 },
      { op: 'add', path: '/c', value: 4 },
      { op: 'remove', path: '/b' },
      { op: 'add', path: '/a/d', value: 5 },
      { op: 'remove', path: '/a' },
      { op: 'add', path: '/e', value: 6 }
    ]

    const result = squashOperations(operations)

    expect(result).toContainEqual({ op: 'add', path: '/c', value: 4 })
    expect(result).toContainEqual({ op: 'add', path: '/e', value: 6 })

    expect(result.some((op) => op.path === '/a' && op.op !== 'remove')).toBe(false)
    expect(result.some((op) => op.path === '/b' && op.op !== 'remove')).toBe(false)
    expect(result.some((op) => op.path === '/a/d')).toBe(false)
  })

  it('should handle nested paths correctly', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a/b/c', value: 1 },
      { op: 'add', path: '/a/b/d', value: 2 },
      { op: 'remove', path: '/a/b' },
      { op: 'add', path: '/a/e', value: 3 }
    ]

    expect(squashOperations(operations)).toEqual([
      { op: 'remove', path: '/a/b' },
      { op: 'add', path: '/a/e', value: 3 }
    ])
  })

  it('should sort remove operations by path length to remove deepest paths first', () => {
    const operations: Operation[] = [
      { op: 'remove', path: '/a' },
      { op: 'remove', path: '/a/b/c' },
      { op: 'remove', path: '/a/b' }
    ]

    const result = squashOperations(operations)

    expect(result.length).toBe(2)
    expect(result).toContainEqual({ op: 'remove', path: '/a' })
    expect(result).toContainEqual({ op: 'remove', path: '/a/b' })

    // The deepest path should come first
    expect(result[0].path.length).toBeGreaterThan(result[1].path.length)
  })

  // Negative/fail cases
  it('should handle operations with invalid paths', () => {
    const operations: Operation[] = [
      { op: 'add', path: '', value: 1 },
      { op: 'add', path: '/', value: 2 }
    ]
    const result = squashOperations(operations)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ op: 'add', path: '/', value: 2 })
  })

  it('should handle operations with malformed paths', () => {
    const operations: Operation[] = [
      { op: 'add', path: 'not-a-json-pointer', value: 1 },
      { op: 'add', path: '/valid/path', value: 2 }
    ]
    // Should still process these operations even though some paths are malformed
    expect(squashOperations(operations)).toEqual([
      { op: 'add', path: 'not-a-json-pointer', value: 1 },
      { op: 'add', path: '/valid/path', value: 2 }
    ])
  })

  it('should handle operations with unsupported op types', () => {
    const operations: Operation[] = [
      { op: 'unsupported' as any, path: '/a', value: 1 },
      { op: 'add', path: '/b', value: 2 }
    ]
    // Should ignore unsupported operations
    const result = squashOperations(operations)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ op: 'add', path: '/b', value: 2 })
  })

  it('should handle operations with missing required properties', () => {
    const operations: Operation[] = [
      { op: 'add' } as any, // Missing path and value
      { op: 'remove' } as any, // Missing path
      { op: 'add', path: '/a', value: 1 } // Valid operation
    ]
    // Should handle or ignore invalid operations
    const result = squashOperations(operations)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual({ op: 'add', path: '/a', value: 1 })
  })

  it('should handle move operations with the same source and destination', () => {
    const operations: Operation[] = [{ op: 'move', from: '/a', path: '/a' }]
    const result = squashOperations(operations)
    expect(result.length).toBe(0)
  })

  it('should handle copy operations with the same source and destination', () => {
    const operations: Operation[] = [{ op: 'copy', from: '/a', path: '/a' }]
    // A copy operation where source and destination are the same should be preserved
    // (though it's redundant, it's not technically invalid)
    expect(squashOperations(operations)).toEqual([{ op: 'copy', from: '/a', path: '/a' }])
  })

  it('should handle operations with special characters in paths', () => {
    const operations: Operation[] = [
      { op: 'add', path: '/a~0b', value: 1 }, // ~ is encoded as ~0
      { op: 'add', path: '/c~1d', value: 2 }, // / is encoded as ~1
      { op: 'add', path: '/e%20f', value: 3 } // Space is percent-encoded
    ]
    // Should handle paths with special characters
    expect(squashOperations(operations)).toEqual(operations)
  })

  it('should handle an extremely large number of operations', () => {
    // Create a large array of operations
    const operations: Operation[] = []
    for (let i = 0; i < 1000; i++) {
      operations.push({ op: 'add', path: `/item${i}`, value: i })
    }

    // Should be able to process a large number of operations
    const result = squashOperations(operations)
    expect(result.length).toBe(1000)
  })

  it('should handle circular references in operation values', () => {
    // Create an object with a circular reference
    const circularObj: any = { name: 'circular' }
    circularObj.self = circularObj

    const operations: Operation[] = [{ op: 'add', path: '/a', value: circularObj }]

    // Should handle circular references without crashing
    const result = squashOperations(operations)
    expect(result.length).toBe(1)
    expect(result[0].op).toBe('add')
    expect(result[0].path).toBe('/a')
    // The circular reference should be preserved
    expect((result[0] as any).value).toBe(circularObj)
  })
})
