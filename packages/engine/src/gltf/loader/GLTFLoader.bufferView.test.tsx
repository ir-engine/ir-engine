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
 * Unit Test suite for loading the `glTF.bufferViews` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { act, render } from '@testing-library/react'
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
describe('glTF.bufferViews Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `bufferView` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.bufferViews

describe('glTF: BufferView Type', () => {
  /**
   * @description Creates the most minimal gltf with one accessor possible, as required by spec
   * */
  function mockGLTFMinimalBufferView() {
    const result = mockGLTF()
    result.bufferViews = [
      {
        buffer: 0,
        byteLength: 0
      }
    ]
    result.buffers = [
      {
        byteLength: 0
      }
    ]
    return result
  }

  describe('buffer', () => {
    it('MUST be defined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.bufferViews![0].buffer
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    it('MUST be an `integer` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].buffer = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    it('MUST be an index into the root `buffers` array', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].buffer = 42 // Not an index into the root `buffers` array
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0 .. glTF.buffers.length-1]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].buffer = -1 // Not in range [0 .. glTF.buffers.length-1]
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })
  }) //:: buffer

  describe('byteOffset', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      delete options.document.bufferViews![0].byteOffset
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).resolves.not.toThrow()
    })

    /**
     * @todo
     * Cannot be tested in our current GLTFLoader implementation
     * The implementation respects the spec, but the output does not.
     * */
    it.todo('SHOULD assign a default value of 0', () => {})

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteOffset */
    it.fails('MUST be an `integer` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].byteOffset = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteOffset */
    it.fails('MUST have a value in range [0..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].byteOffset = -1 // Not in range [0..]
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    it.todo('MUST specify the offset into the referenced buffer in bytes', () => {})
  }) //:: byteOffset

  describe('byteLength', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteLength */
    it.fails('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.bufferViews![0].byteLength
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteLength */
    it.fails('MUST be an `integer` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].byteLength = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteLength */
    it.fails('MUST have a value in range [1..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].byteLength = 0 // Not in range [1..]
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteLength */
    it.fails('MUST ensure (bufferView.byteOffset + bufferView.byteLength) <= buffer.byteLength', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      const bufferView = options.document.bufferViews![0]!
      bufferView.byteOffset = 42 // Invalid byteOffset value, to provoke the error
      const result = bufferView.byteOffset! + bufferView.byteLength
      const Expected = options.document.buffers![bufferView.buffer].byteLength
      expect(result).not.toBeLessThanOrEqual(Expected)
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })
  }) //:: byteLength

  describe('byteStride', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      delete options.document.bufferViews![0].byteStride
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteStride */
    it.fails('MUST be defined when two or more accessors use the same buffer view', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.accessors = []
      for (const _ of [0, 1])
        options.document.accessors.push({
          componentType: 5126, // FLOAT
          type: 'SCALAR',
          count: 1,
          bufferView: 0
        })
      delete options.document.bufferViews![0].byteStride
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteStride */
    it.fails('MUST be an `integer` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].byteStride = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.byteStride */
    it.fails('MUST have a value in range [4..252] when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].byteStride = 253 // Not in range [4..252]
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    it.todo('MUST ensure that data is tightly packed when not defined', () => {})

    /*
    // @todo: Are these valid ?
    it.todo('MUST be a multiple of 4 when defined', () => {})
    it.todo('MUST specify the stride between consecutive elements for interleaved data', () => {})
    it.todo('MUST only be defined when the `target` property indicates vertex attributes (ARRAY_BUFFER)', () => {})
    */
  }) //:: byteStride

  describe('target', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      delete options.document.bufferViews![0].target
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.target */
    it.fails('MUST be an `integer` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].target = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.target */
    it.fails('MUST be one of the allowed values: 34962 (ARRAY_BUFFER) | 34963 (ELEMENT_ARRAY_BUFFER)', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].target = 42 // Not an allowed value
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })
  }) //:: target

  describe('name', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      delete options.document.bufferViews![0].name
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.name */
    it.fails('MUST be a `string` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].name = 42 as any // Not a string
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      delete options.document.bufferViews![0].extensions
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.bufferView.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      options.document.bufferViews![0].extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBufferView())
      delete options.document.bufferViews![0].extras
      expect(GLTFLoaderFunctions.loadBufferView(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: BufferView
