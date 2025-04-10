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

/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.accessors` root property and all its children.
 * */
import { InterleavedBufferAttribute } from 'three'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
  // Clear the dependency cache before each test
  DependencyCache.clear()
})

/**
 * @todo
 * Cannot possibly tested in our current GLTFLoader implementation
 * It requires a GLTFLoader gltf root properties validation function that does not exist.
 * */
describe('glTF.accessors Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `accessor`s when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.accessors

/**
 * @todo
 * Should be accessing the loader from the root GLTFLoader function (currently does not exist)
 * */
describe('glTF: Accessor Type', () => {
  /**
   * @description Creates the most minimal gltf with one accessor possible, as required by spec
   * */
  function mockGLTFMinimal() {
    const result = mockGLTF()
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR',
        bufferView: undefined,
        byteOffset: undefined,
        normalized: undefined,
        sparse: undefined,
        min: undefined,
        max: undefined,
        extensions: undefined,
        extras: undefined
      }
    ]
    return result
  }

  it('MUST throw an error when trying to access an accessor that does not exist and the accessors property is not defined', async () => {
    const options = mockGLTFOptions(mockGLTF())
    await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrow()
  })

  describe('bufferView', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it('MUST be initialized with zeros when undefined', async () => {
      const Expected = 0
      const gltf = mockGLTFMinimal()
      gltf.accessors = []
      gltf.accessors!.push({
        componentType: 5126, // FLOAT
        count: 3,
        type: 'VEC3',
        bufferView: undefined // Explicitly set bufferView to undefined
      })
      const options = mockGLTFOptions(gltf)

      const result = await GLTFLoaderFunctions.loadAccessor(options, 0)
      expect(result.array.length).toBe(9)
      result.array.forEach((value: number) => expect(value).toBe(Expected))
    })

    /**
     * @todo
     * Cannot be tested in our current GLTFLoader implementation
     * The implementation respects the spec, but the output does not.
     * */
    it.fails('MUST be an integer in range [0..]', async () => {
      const gltf = mockGLTFMinimal()
      const options = mockGLTFOptions(gltf)
      const result = (await GLTFLoaderFunctions.loadAccessor(options, 0)) as any

      // The bufferView index should be a non-negative integer
      expect(Number.isInteger(result.bufferView)).toBe(true)
      expect(result.bufferView).toBeGreaterThanOrEqual(0)
    })
    it.todo('MAY override zeros with actual values from `glTF.accessors.sparse` or extensions', () => {})
  }) //:: bufferView

  describe('byteOffset', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /**
     * @todo
     * Cannot be tested in our current GLTFLoader implementation
     * The implementation respects the spec, but the output does not.
     * */
    it.fails('SHOULD assign a default value of 0', async () => {
      const Expected = 0
      const options = mockGLTFOptions(mockGLTFMinimal())
      const result = ((await GLTFLoaderFunctions.loadAccessor(options, 0)) as InterleavedBufferAttribute).offset
      expect(result).toBe(Expected)
    })

    it.todo('MUST be a multiple of the size of the component datatype.', () => {})
    it.todo('MUST NOT be defined when bufferView is undefined.', () => {})
    it.todo('MUST be an `integer` in range [0..]', () => {})
    it.todo('MUST be compatible with `webgl.vertexAttribPointer()`', () => {})
  }) //:: byteOffset

  describe('componentType', () => {
    it.todo('MUST be defined', () => {})
    it.todo(
      'MUST NOT allow `UNSIGNED_INT` type for any accessor that is not referenced by `mesh.primitive.indices`.',
      () => {}
    )
    it.todo('MUST be one of the `integer` allowed values: ', () => {
      // 5120 BYTE
      // 5121 UNSIGNED_BYTE
      // 5122 SHORT
      // 5123 UNSIGNED_SHORT
      // 5125 UNSIGNED_INT
      // 5126 FLOAT
    })
    it.todo('MUST be compatible with the `type` parameter of `webgl.vertexAttribPointer()`', () => {})
    it.todo('MUST treat the accessor data as having the correct TypedArray type', () => {
      // TODO: Separate test statement for each
      // 5120 BYTE           : Int8Array
      // 5121 UNSIGNED_BYTE  : Uint8Array
      // 5122 SHORT          : Int16Array
      // 5123 UNSIGNED_SHORT : Uint16Array
      // 5125 UNSIGNED_INT   : Uint32Array
      // 5126 FLOAT          : Float32Array
    })
  }) //:: componentType

  describe('normalized', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it.todo('MUST NOT be set to true for accessors with `FLOAT` or `UNSIGNED_INT` component type.', () => {})
    it.todo('MUST be a boolean type when defined', () => {})
    it.todo('SHOULD assign a default value of false', () => {})
    it.todo('MUST be compatible with the `normalized` parameter of `webgl.vertexAttribPointer()`', () => {})
  }) //:: normalized

  describe('count', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `integer` in range [1..]', () => {})
  }) //:: count

  describe('type', () => {
    it.todo('MUST be defined', () => {})
    it.todo(
      'MUST be one of the `string` allowed values: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4"',
      () => {}
    )
  }) //:: type

  describe('max', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be an array of `number`s', () => {})
    it.todo('MUST have a length in the range [1-16]', () => {})
    it.todo('MUST have a length corresponding to the type property:', () => {
      // TODO: Separate test statement for each
      // "SCALAR" : 1
      // "VEC2"   : 2
      // "VEC3"   : 3
      // "VEC4"   : 4
      // "MAT2"   : 4
      // "MAT3"   : 9
      // "MAT4"   : 16
    })
    it.todo('MUST treat values as having the same data type as accessor’s componentType.', () => {})
    it.todo('MUST have the same length as the min array.', () => {})
    it.todo(
      'MUST contain maximum values of accessor data with sparse substitution applied when the accessor is sparse.',
      () => {}
    )
    it.todo(
      'MUST NOT modify values based on the normalized property. They always correspond to the actual values stored in the buffer.',
      () => {}
    )
  }) //:: max

  describe('min', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be an array of `number`s', () => {})
    it.todo('MUST have a length in the range [1-16]', () => {})
    it.todo('MUST have a length corresponding to the type property:', () => {
      // TODO: Separate test statement for each
      // "SCALAR" : 1
      // "VEC2"   : 2
      // "VEC3"   : 3
      // "VEC4"   : 4
      // "MAT2"   : 4
      // "MAT3"   : 9
      // "MAT4"   : 16
    })
    it.todo('MUST treat values as having the same data type as accessor’s componentType.', () => {})
    it.todo('MUST have the same length as the max array.', () => {})
    it.todo(
      'MUST contain minimum values of accessor data with sparse substitution applied when the accessor is sparse.',
      () => {}
    )
    it.todo(
      'MUST NOT modify values based on the normalized property. They always correspond to the actual values stored in the buffer.',
      () => {}
    )
  }) //:: min

  // @note Accessor.sparse has its own describe for its properties, separate from this one
  describe('sparse', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be an `accessor.sparse` type when defined', () => {})
  }) //:: sparse

  describe('name', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a `string` type when defined', () => {})
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimal())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Accessor

describe('glTF: Accessor.Sparse Type', () => {
  describe('count', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST have an `integer` value', () => {})
    it.todo('MUST have a value in range [1..]', () => {})
  }) //:: count

  // @note Accessor.Sparse.indices has its own describe for its properties, separate from this one
  describe('indices', () => {
    it.todo('MUST be defined', () => {})
  }) //:: indices

  // @note Accessor.Sparse.values has its own describe for its properties, separate from this one
  describe('values', () => {
    it.todo('MUST be defined', () => {})
  }) //:: values

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Accessor.Sparse

describe('glTF: Accessor.Sparse.Indices Type', () => {
  describe('bufferView', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST have an `integer` value', () => {})
    it.todo('MUST have a value in range [0..]', () => {})
    it.todo('MUST reference a bufferView that has `count` indices', () => {})
    it.todo('MUST reference a bufferView that has indices that strictly increase', () => {})
    it.todo('MUST reference a bufferView that does NOT have its target property defined.', () => {})
    it.todo('MUST reference a bufferView that does NOT have its byteStride property defined.', () => {})
    it.todo('MUST reference a bufferView that is aligned with the componentType byte length', () => {})
    it.todo('MUST ensure that the optional byteOffset is aligned with the componentType byte length', () => {})
  }) //:: bufferView

  describe('byteOffset', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 0', () => {})
    it.todo('MUST have an `integer` value', () => {})
    it.todo('MUST have a value in range [0..]', () => {})
  }) //:: byteOffset

  describe('componentType', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be one of the integer allowed values:', () => {
      // 5121 UNSIGNED_BYTE
      // 5123 UNSIGNED_SHORT
      // 5125 UNSIGNED_INT
    })
  }) //:: componentType

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Accessor.Sparse.Indices

describe('glTF: Accessor.Sparse.Values Type', () => {
  describe('bufferView', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST reference a bufferView that has `accessor.sparse.count` number of components', () => {})
    it.todo('MUST reference a bufferView that has the same component type as the base accessor', () => {})
    it.todo('MUST reference a bufferView that has elements that are tightly packed', () => {})
    it.todo(
      'MUST reference a bufferView that has data that is aligned by the same rules than the base accessor',
      () => {}
    )
    it.todo('MUST reference a bufferView that does NOT have its target property defined.', () => {})
    it.todo('MUST reference a bufferView that does NOT have its byteStride property defined.', () => {})
  }) //:: bufferView

  describe('byteOffset', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 0', () => {})
    it.todo('MUST have an `integer` value', () => {})
    it.todo('MUST have a value in range [0..]', () => {})
  }) //:: byteOffset

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Accessor.Sparse.Values
