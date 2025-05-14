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

/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.accessors` root property and all its children.
 * */
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { act, render } from '@testing-library/react'
import { InterleavedBufferAttribute } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
  // Clear the dependency cache before each test
  DependencyCache.clear()
})

overrideFileLoaderLoad()

beforeEach(async () => {
  createEngine()
  startEngineReactor()

  await act(() => render(null))
})

afterEach(() => {
  destroyEngine()
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
  function mockGLTFMinimalAccessor() {
    const result = mockGLTF()
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
        // Cannot explicitly set to undefined because `'a' in obj` would return true
        // bufferView: undefined,
        // byteOffset: undefined,
        // normalized: undefined,
        // sparse: undefined,
        // min: undefined,
        // max: undefined,
        // extensions: undefined,
        // extras: undefined
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
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it('MUST be initialized with zeros when undefined', async () => {
      const Expected = 0
      const gltf = mockGLTFMinimalAccessor()
      gltf.accessors = []
      gltf.accessors!.push({
        componentType: 5126, // FLOAT
        count: 3,
        type: 'VEC3'
        // bufferView: undefined // Do not define .bufferView. Can't set to `undefined` because `'a' in obj` would return true
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
      const gltf = mockGLTFMinimalAccessor()
      const options = mockGLTFOptions(gltf)
      const result = (await GLTFLoaderFunctions.loadAccessor(options, 0)) as any

      expect(Number.isInteger(result.bufferView)).toBe(true)
      expect(result.bufferView).toBeGreaterThanOrEqual(0)
    })

    it('MAY override zeros with actual values from `glTF.accessors.sparse` or extensions', async () => {
      const Expected = 0.42
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())

      const buffer = new ArrayBuffer(24)
      new Float32Array(buffer, 0, 4).set([0, 0, 0, 0])
      new Uint16Array(buffer, 16, 1).set([1]) // Sparse index
      new Float32Array(buffer, 20, 1).set([Expected])

      options.document.accessors = []
      options.document.accessors.push({
        componentType: 5126, // FLOAT
        type: 'SCALAR',
        count: 4,
        bufferView: 0,
        byteOffset: 0,
        sparse: {
          count: 1,
          indices: {
            bufferView: 0,
            byteOffset: 16,
            componentType: 5123 // UNSIGNED_SHORT
          },
          values: {
            bufferView: 0,
            byteOffset: 20
          }
        }
      })
      options.document.bufferViews = [
        {
          buffer: 0,
          byteOffset: 0,
          byteLength: buffer.byteLength
        }
      ]
      options.document.buffers = [
        {
          byteLength: buffer.byteLength
        }
      ]

      const result = await GLTFLoaderFunctions.loadAccessor(options, 0)
      result.array.forEach((value: number) => expect(value).toBe(0))
    })
  }) //:: bufferView

  describe('byteOffset', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /**
     * @todo
     * Cannot be tested in our current GLTFLoader implementation
     * The implementation respects the spec, but the output does not.
     * */
    it.fails('SHOULD assign a default value of 0', async () => {
      const Expected = 0
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      const result = ((await GLTFLoaderFunctions.loadAccessor(options, 0)) as InterleavedBufferAttribute).offset
      expect(result).toBe(Expected)
    })

    it('MUST be a multiple of the size of the component datatype.', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].bufferView = 0
      options.document.accessors![0].byteOffset = 3 // Not a multiple of 4
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.byteOffset */
    it.fails('MUST NOT be defined when bufferView is undefined.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].byteOffset = 3 // Not a multiple of 4
      expect(options.document.accessors![0].bufferView).toBeUndefined()
      expect(options.document.accessors![0].byteOffset).not.toBeUndefined()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    it('MUST be an `integer`', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].bufferView = 0
      options.document.accessors![0].byteOffset = 3.42 // Not an integer
      expect(options.document.accessors![0].bufferView).toBeDefined()
      expect(Number.isInteger(options.document.accessors![0].byteOffset)).toBeFalsy()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    it('MUST be an `integer` in range [0..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].bufferView = 0
      options.document.accessors![0].byteOffset = -1 // Not in range [0..]
      expect(options.document.accessors![0].bufferView).toBeDefined()
      expect(options.document.accessors![0].byteOffset).not.toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(options.document.accessors![0].byteOffset)).toBeTruthy()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: byteOffset

  describe('componentType', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].componentType
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    it('MUST be one of the `integer` allowed values: ', () => {
      const allowedValues = [
        5120, // BYTE
        5121, // UNSIGNED_BYTE
        5122, // SHORT
        5123, // UNSIGNED_SHORT
        5125, // UNSIGNED_INT
        5126 // FLOAT
      ]
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 42 as any // Not an allowed value
      expect(allowedValues.includes(options.document.accessors![0].componentType)).toBeFalsy()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.*/
    it.fails(
      'MUST NOT allow `UNSIGNED_INT` type for any accessor that is not referenced by `mesh.primitive.indices`.',
      () => {
        const options = mockGLTFOptions(mockGLTFMinimalAccessor())
        options.document.accessors![0].componentType = 5125 // UNSIGNED_INT
        expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
      }
    )

    it('MUST treat the accessor data as an Int8Array when componentType is 5120 BYTE', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5120 // BYTE
      expect((await GLTFLoaderFunctions.loadAccessor(options, 0)).array.BYTES_PER_ELEMENT).toBe(1)
    })

    it('MUST treat the accessor data as an Int8Array when componentType is 5121 UNSIGNED_BYTE', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5121 // UNSIGNED_BYTE
      expect((await GLTFLoaderFunctions.loadAccessor(options, 0)).array.BYTES_PER_ELEMENT).toBe(1)
    })

    it('MUST treat the accessor data as an Int16Array when componentType is 5122 SHORT', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5122 // SHORT
      expect((await GLTFLoaderFunctions.loadAccessor(options, 0)).array.BYTES_PER_ELEMENT).toBe(2)
    })

    it('MUST treat the accessor data as an Uint16Array when componentType is 5123 UNSIGNED_SHORT', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5123 // UNSIGNED_SHORT
      expect((await GLTFLoaderFunctions.loadAccessor(options, 0)).array.BYTES_PER_ELEMENT).toBe(2)
    })

    it('MUST treat the accessor data as an Uint32Array when componentType is 5125 UNSIGNED_INT', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5125 // UNSIGNED_INT
      options.document.meshes = []
      options.document.meshes.push({
        primitives: [
          {
            attributes: {},
            indices: 0 // A mesh must the accessor. Spec requires the loader to throw otherwise.
          }
        ]
      })
      expect((await GLTFLoaderFunctions.loadAccessor(options, 0)).array.BYTES_PER_ELEMENT).toBe(4)
    })

    it('MUST treat the accessor data as an Float32Array when componentType is 5126 FLOAT', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5126 // FLOAT
      expect((await GLTFLoaderFunctions.loadAccessor(options, 0)).array.BYTES_PER_ELEMENT).toBe(4)
    })
  }) //:: componentType

  describe('normalized', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.normalized */
    it.fails('MUST NOT be set to true for accessors with `FLOAT` component type.', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].normalized = true
      options.document.accessors![0].componentType = 5126 // FLOAT
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.normalized */
    it.fails('MUST NOT be set to true for accessors with `UNSIGNED_INT` component type.', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].normalized = true
      options.document.accessors![0].componentType = 5125 // UNSIGNED_INT
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.normalized */
    it.fails('MUST be a boolean type when defined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].normalized = 'SomeIncorrectValue' as any // Not a boolean
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrow()
    })

    it('SHOULD assign a default value of false', async () => {
      const Expected = false
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      expect(options.document.accessors![0].normalized).toBeUndefined()
      const result = ((await GLTFLoaderFunctions.loadAccessor(options, 0)) as InterleavedBufferAttribute).normalized
      expect(result).toBe(Expected)
    })
  }) //:: normalized

  describe('count', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.count */
    it.fails('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].count
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.count */
    it.fails('MUST be an `integer`', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].count = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.count */
    it.fails('MUST be in range [1..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].count = 0 // Not in range [1..]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: count

  describe('type', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.type */
    it.fails('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].type
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.type */
    it.fails(
      'MUST be one of the `string` allowed values: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4"',
      () => {
        const options = mockGLTFOptions(mockGLTFMinimalAccessor())
        options.document.accessors![0].type = 'SomeIncorrectValue' as any // Not an allowed value
        expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
      }
    )
  }) //:: type

  describe('max', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST be an array of `number`s', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].min = [1, 2, 3]
      options.document.accessors![0].max = ['one', 'two', 'three'] as any // Not an array of `number`s
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length in the range [1-16]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].min = [1, 2, 3]
      options.document.accessors![0].max = [] // Not in range [1-16]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 1 for SCALAR type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'SCALAR'
      options.document.accessors![0].min = [1]
      options.document.accessors![0].max = [1, 2, 3] // Not length 1
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 2 for VEC2 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC2'
      options.document.accessors![0].min = [1]
      options.document.accessors![0].max = [1] // Not length 2
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 3 for VEC3 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].min = [1, 2]
      options.document.accessors![0].max = [1, 2] // Not length 3
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 4 for VEC4 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC4'
      options.document.accessors![0].min = [1, 2, 3]
      options.document.accessors![0].max = [1, 2, 3] // Not length 4
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 4 for MAT2 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'MAT2'
      options.document.accessors![0].min = [1, 2, 3]
      options.document.accessors![0].max = [1, 2, 3] // Not length 4
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 9 for MAT3 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'MAT3'
      options.document.accessors![0].min = [1, 2, 3, 4, 5, 6, 7, 8]
      options.document.accessors![0].max = [1, 2, 3, 4, 5, 6, 7, 8] // Not length 9
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have a length of 16 for MAT4 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'MAT4'
      options.document.accessors![0].min = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      options.document.accessors![0].max = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // Not length 16
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST have the same length as the min array.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].min = [1, 2, 3]
      options.document.accessors![0].max = [1, 2] // Not same length as min
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST treat values as having the same data type as accessor’s componentType.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5125 // UNSIGNED_INT
      options.document.accessors![0].max = [-1, -2.0, -3] // Not unsigned ints
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo */
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
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST be an array of `number`s', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].max = [1, 2, 3]
      options.document.accessors![0].min = ['one', 'two', 'three'] as any // Not an array of `number`s
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length in the range [1-16]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].max = [1, 2, 3]
      options.document.accessors![0].min = [] // Not in range [1-16]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 1 for SCALAR type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'SCALAR'
      options.document.accessors![0].max = [1]
      options.document.accessors![0].min = [1, 2, 3] // Not length 1
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 2 for VEC2 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC2'
      options.document.accessors![0].max = [1]
      options.document.accessors![0].min = [1] // Not length 2
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 3 for VEC3 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].max = [1, 2]
      options.document.accessors![0].min = [1, 2] // Not length 3
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 4 for VEC4 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC4'
      options.document.accessors![0].max = [1, 2, 3]
      options.document.accessors![0].min = [1, 2, 3] // Not length 4
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 4 for MAT2 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'MAT2'
      options.document.accessors![0].max = [1, 2, 3]
      options.document.accessors![0].min = [1, 2, 3] // Not length 4
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 9 for MAT3 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'MAT3'
      options.document.accessors![0].max = [1, 2, 3, 4, 5, 6, 7, 8]
      options.document.accessors![0].min = [1, 2, 3, 4, 5, 6, 7, 8] // Not length 9
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have a length of 16 for MAT4 type property', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'MAT4'
      options.document.accessors![0].max = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      options.document.accessors![0].min = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // Not length 16
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.min */
    it.fails('MUST have the same length as the max array.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].type = 'VEC3'
      options.document.accessors![0].max = [1, 2, 3]
      options.document.accessors![0].min = [1, 2] // Not same length as max
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.max */
    it.fails('MUST treat values as having the same data type as accessor’s componentType.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].componentType = 5125 // UNSIGNED_INT
      options.document.accessors![0].min = [-1, -2.0, -3] // Not unsigned ints
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo */
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
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    it('MUST be an `accessor.sparse` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].sparse = 42 as any // Not an accessor.sparse type
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: sparse

  describe('name', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.name */
    it.fails('MUST be a `string` type when defined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].name = 42 as any // Not a string
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      options.document.accessors![0].extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAccessor())
      await expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Accessor

describe('glTF: Accessor.Sparse Type', () => {
  /**
   * @description Creates the most minimal gltf with one sparse accessor possible, as required by spec
   * */
  function mockGLTFMinimalSparse() {
    const result = mockGLTF()
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR',
        sparse: {
          count: 1,
          indices: {
            bufferView: 0,
            byteOffset: 0,
            componentType: 5123 // UNSIGNED_SHORT
          },
          values: {
            bufferView: 0,
            byteOffset: 0
          }
        }
      }
    ]
    result.bufferViews = [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 0
      }
    ]
    /** @todo How to setup the buffer URI so that tests pass ? */
    result.buffers = [
      {
        byteLength: 0
      }
    ]
    return result
  }

  describe('count', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.count */
    it.fails('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].sparse.count
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.count */
    it.fails('MUST have an `integer` value', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      // @ts-expect-error Force a string into the integer count property
      options.document.accessors![0].sparse!.count = 'NotAnIntegerCount' // Not an integer
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.count */
    it.fails('MUST have a value in range [1..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      options.document.accessors![0].sparse!.count = 0 // Not in range [1..]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: count

  // @note Accessor.Sparse.indices has its own describe for its properties, separate from this one
  describe('indices', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].sparse.indices
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: indices

  // @note Accessor.Sparse.values has its own describe for its properties, separate from this one
  describe('values', () => {
    /** @todo Depends on setting up the buffer URI in mockGLTFMinimalSparse */
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].sparse.values
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: values

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      options.document.accessors![0].sparse!.extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparse())
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Accessor.Sparse

describe('glTF: Accessor.Sparse.Indices Type', () => {
  /**
   * @description Creates the most minimal gltf with one sparse accessor possible, as required by spec
   * */
  function mockGLTFMinimalSparseIndices() {
    const result = mockGLTF()
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR',
        sparse: {
          count: 1,
          indices: {
            bufferView: 0,
            byteOffset: 0,
            componentType: 5123 // UNSIGNED_SHORT
          },
          values: {
            bufferView: 0,
            byteOffset: 0
          }
        }
      }
    ]
    const byteLength = result.accessors[0].count * 2
    result.bufferViews = [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: byteLength, // UNSIGNED_SHORT is 2 bytes
        extensions: {}
      }
    ]
    result.buffers = [
      {
        byteLength: byteLength
      }
    ]
    return result
  }

  describe('bufferView', () => {
    it('MUST be defined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].sparse.indices.bufferView
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    it('MUST have an `integer` value', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      // @ts-expect-error Force a string into the integer bufferView property
      options.document.accessors![0].sparse.indices.bufferView = 'NotAnIntegerBufferView' // Not an integer
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      options.document.accessors![0].sparse!.indices.bufferView = -1 // Not in range [0..]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that has `count` indices', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      options.document.accessors![0].sparse!.count = 2 // Set an invalid count
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /*
    // @todo How to access the data of the buffer
    it('MUST reference a bufferView that has indices that strictly increase', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      const bufferViewID = options.document.accessors![0].sparse!.indices.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      const buffer = options.document.buffers![bufferView.buffer]
      const indices = new Uint16Array(buffer, bufferView.byteOffset, bufferView.byteLength / 2)

      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
    */

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that does NOT have its target property defined.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      const bufferViewID = options.document.accessors![0].sparse!.indices.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      bufferView.target = 34963 // ARRAY_BUFFER
      expect(bufferView.target).not.toBeUndefined()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that does NOT have its byteStride property defined.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      const bufferViewID = options.document.accessors![0].sparse!.indices.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      bufferView.byteStride = 4 // Not undefined
      expect(bufferView.byteStride).not.toBeUndefined()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that is aligned with the componentType byte length', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      const bufferViewID = options.document.accessors![0].sparse!.indices.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      bufferView.byteOffset = 1 // Not aligned with componentType byte length
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST ensure that the optional byteOffset is aligned with the componentType byte length', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      options.document.accessors![0].sparse!.indices.byteOffset = 1 // Not aligned with componentType byte length
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: bufferView

  describe('byteOffset', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      delete options.document.accessors![0].sparse!.indices.byteOffset
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST have an `integer` value', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      // @ts-expect-error Force a string into the integer byteOffset property
      options.document.accessors![0].sparse!.indices.byteOffset = 'NotAnIntegerByteOffset' // Not an integer
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST have a value in range [0..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      options.document.accessors![0].sparse!.indices.byteOffset = -1 // Not in range [0..]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /**
     * @todo
     * Cannot be tested in our current GLTFLoader implementation
     * The implementation respects the spec, but the output does not.
     * */
    it.fails('SHOULD assign a default value of 0', async () => {
      const Expected = 0
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      const result = ((await GLTFLoaderFunctions.loadAccessor(options, 0)) as InterleavedBufferAttribute).offset
      expect(result).toBe(Expected)
    })
  }) //:: byteOffset

  describe('componentType', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].sparse.indices.componentType
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    it('MUST be one of the integer allowed values', () => {
      const allowedValues = [5121, 5123, 5125] // 5121 UNSIGNED_BYTE, 5123 UNSIGNED_SHORT, 5125 UNSIGNED_INT
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      options.document.accessors![0].sparse!.indices.componentType = 42 as any // Not an allowed value
      expect(allowedValues.includes(options.document.accessors![0].sparse!.indices.componentType)).toBeFalsy()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: componentType

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      delete options.document.accessors![0].sparse!.indices.extensions
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      options.document.accessors![0].sparse!.indices.extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseIndices())
      delete options.document.accessors![0].sparse!.indices.extras
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Accessor.Sparse.Indices

describe('glTF: Accessor.Sparse.Values Type', () => {
  /**
   * @description Creates the most minimal gltf with one sparse accessor possible, as required by spec
   * */
  function mockGLTFMinimalSparseValues() {
    const result = mockGLTF()
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR',
        sparse: {
          count: 1,
          indices: {
            bufferView: 0,
            byteOffset: 0,
            componentType: 5123 // UNSIGNED_SHORT
          },
          values: {
            bufferView: 0,
            byteOffset: 0
          }
        }
      }
    ]
    const byteLength = result.accessors[0].count * 2 // UNSIGNED_SHORT is 2 bytes
    result.bufferViews = [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: byteLength,
        byteStride: 2,
        extensions: {}
      }
    ]
    result.buffers = [
      {
        byteLength: byteLength
      }
    ]
    return result
  }

  describe('bufferView', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.accessors![0].sparse.values.bufferView
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that has `accessor.sparse.count` number of components', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      options.document.accessors![0].sparse!.count = 2 // Set an invalid count
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that has the same component type as the base accessor', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      const bufferViewID = options.document.accessors![0].sparse!.values.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      bufferView.byteLength = 1 // Not aligned with componentType byte length
      expect(bufferView.byteLength % 2).not.toBe(0) // UNSIGNED_SHORT is 2 bytes
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that does NOT have its target property defined.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      const bufferViewID = options.document.accessors![0].sparse!.values.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      bufferView.target = 34962 // Define a target for the bufferView
      expect(bufferView.target).not.toBeUndefined()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.bufferView */
    it.fails('MUST reference a bufferView that does NOT have its byteStride property defined.', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      const bufferViewID = options.document.accessors![0].sparse!.values.bufferView
      const bufferView = options.document.bufferViews![bufferViewID]!
      bufferView.byteStride = 4 // Not undefined
      expect(bufferView.byteStride).not.toBeUndefined()
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: bufferView

  describe('byteOffset', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      delete options.document.accessors![0].sparse!.values.byteOffset
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.values.byteOffset */
    it.fails('MUST have an `integer` value', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      // @ts-expect-error Force a string into the integer byteOffset property
      options.document.accessors![0].sparse!.values.byteOffset = 'NotAnIntegerByteOffset' // Not an integer
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.values.byteOffset */
    it.fails('MUST have a value in range [0..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      options.document.accessors![0].sparse!.values.byteOffset = -1 // Not in range [0..]
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })

    /**
     * @todo
     * Cannot be tested in our current GLTFLoader implementation
     * The implementation respects the spec, but the output does not.
     * */
    it.fails('SHOULD assign a default value of 0', async () => {
      const Expected = 0
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      const result = ((await GLTFLoaderFunctions.loadAccessor(options, 0)) as InterleavedBufferAttribute).offset
      expect(result).toBe(Expected)
    })
  }) //:: byteOffset

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      delete options.document.accessors![0].sparse!.values.extensions
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.accessor.sparse.values.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      options.document.accessors![0].sparse!.values.extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalSparseValues())
      delete options.document.accessors![0].sparse!.values.extras
      expect(GLTFLoaderFunctions.loadAccessor(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Accessor.Sparse.Values
