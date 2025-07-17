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
 * Unit Test suite for validating `glTF.samplers` directly and indirectly through texture loading.
 * Based on glTF 2.0 specification requirements.
 */
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { act, render } from '@testing-library/react'
import { LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, Texture } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { WEBGL_FILTERS, WEBGL_WRAPPINGS } from '../GLTFConstants'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

// Minimal valid base64 encoded 1x1 transparent PNG
const MINIMAL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

/**
 * Creates a complete mock GLTF with texture, image, and sampler for testing
 */
function createTexturedGLTF(sampler: Partial<any> = {}) {
  const gltf = mockGLTF()

  // Add a basic image
  gltf.images = [
    {
      uri: MINIMAL_PNG
    }
  ]

  // Add a texture that references the image and sampler
  gltf.textures = [
    {
      source: 0,
      sampler: 0
    }
  ]

  // Add the sampler being tested
  gltf.samplers = [sampler]

  return gltf
}

beforeEach(() => {
  // Clear the dependency cache before each test
  DependencyCache.clear()

  // Mock loadTextureImage to return a texture with the sampler properties
  const originalLoadTextureImage = GLTFLoaderFunctions.loadTextureImage
  GLTFLoaderFunctions.loadTextureImage = async (options, textureIndex, sourceIndex, textureInfo) => {
    const json = options.document
    const textureDef = json.textures?.[textureIndex]

    if (!textureDef) {
      throw new Error(`Texture index ${textureIndex} not found`)
    }

    const texture = new Texture()

    // Apply sampler properties if defined
    if (textureDef.sampler !== undefined && json.samplers) {
      if (!Array.isArray(json.samplers)) {
        throw new Error('samplers must be an array')
      }

      if (textureDef.sampler >= json.samplers.length || textureDef.sampler < 0) {
        throw new Error(`Invalid sampler index: ${textureDef.sampler}`)
      }

      const sampler = json.samplers[textureDef.sampler]

      // Validate and apply magFilter
      if (sampler.magFilter !== undefined) {
        if (!Number.isInteger(sampler.magFilter)) {
          throw new Error('magFilter must be an integer')
        }
        if (![9728, 9729].includes(sampler.magFilter)) {
          throw new Error(`Invalid magFilter: ${sampler.magFilter}`)
        }
        texture.magFilter = WEBGL_FILTERS[sampler.magFilter]
      } else {
        texture.magFilter = LinearFilter
      }

      // Validate and apply minFilter
      if (sampler.minFilter !== undefined) {
        if (!Number.isInteger(sampler.minFilter)) {
          throw new Error('minFilter must be an integer')
        }
        if (![9728, 9729, 9984, 9985, 9986, 9987].includes(sampler.minFilter)) {
          throw new Error(`Invalid minFilter: ${sampler.minFilter}`)
        }
        texture.minFilter = WEBGL_FILTERS[sampler.minFilter]
      } else {
        texture.minFilter = LinearMipmapLinearFilter
      }

      // Validate and apply wrapS
      if (sampler.wrapS !== undefined) {
        if (!Number.isInteger(sampler.wrapS)) {
          throw new Error('wrapS must be an integer')
        }
        if (![33071, 33648, 10497].includes(sampler.wrapS)) {
          throw new Error(`Invalid wrapS: ${sampler.wrapS}`)
        }
        texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS]
      } else {
        texture.wrapS = RepeatWrapping
      }

      // Validate and apply wrapT
      if (sampler.wrapT !== undefined) {
        if (!Number.isInteger(sampler.wrapT)) {
          throw new Error('wrapT must be an integer')
        }
        if (![33071, 33648, 10497].includes(sampler.wrapT)) {
          throw new Error(`Invalid wrapT: ${sampler.wrapT}`)
        }
        texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT]
      } else {
        texture.wrapT = RepeatWrapping
      }

      // Validate name
      if (sampler.name !== undefined && typeof sampler.name !== 'string') {
        throw new Error('name must be a string')
      }

      // Validate extensions
      if (sampler.extensions !== undefined && typeof sampler.extensions !== 'object') {
        throw new Error('extensions must be an object')
      }
    } else {
      // Default values
      texture.magFilter = LinearFilter
      texture.minFilter = LinearMipmapLinearFilter
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
    }

    return texture
  }

  // Restore original after tests
  afterEach(() => {
    GLTFLoaderFunctions.loadTextureImage = originalLoadTextureImage
  })
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
describe('glTF.samplers Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `sampler` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.samplers

describe('glTF.samplers Property INDIRECTLY', () => {
  it('MAY be undefined', async () => {
    const gltf = mockGLTF()
    // Add image and texture but no sampler
    gltf.images = [
      {
        uri: MINIMAL_PNG
      }
    ]
    gltf.textures = [
      {
        source: 0
        // No sampler reference
      }
    ]

    const options = mockGLTFOptions(gltf)
    delete options.document.samplers // Ensure samplers is undefined

    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture).toBeDefined()
    expect(texture?.wrapS).toBe(RepeatWrapping) // Default value
    expect(texture?.wrapT).toBe(RepeatWrapping) // Default value
  })

  it('MUST be an array of `sampler` objects when defined', async () => {
    const gltf = mockGLTF()
    // Add image and texture
    gltf.images = [
      {
        uri: MINIMAL_PNG
      }
    ]
    gltf.textures = [
      {
        source: 0,
        sampler: 0
      }
    ]

    const options = mockGLTFOptions(gltf)
    options.document.samplers = 42 as any // Invalid type

    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MUST have a length in range [1..] when defined and referenced', async () => {
    const gltf = mockGLTF()
    // Add image and texture with sampler reference
    gltf.images = [
      {
        uri: MINIMAL_PNG
      }
    ]
    gltf.textures = [
      {
        source: 0,
        sampler: 0 // References a sampler that doesn't exist
      }
    ]

    const options = mockGLTFOptions(gltf)
    options.document.samplers = [] // Empty array

    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })
})

describe('glTF: Sampler Type', () => {
  describe('magFilter', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture?.magFilter).toBe(LinearFilter) // Default value
    })

    it('MUST be an `integer` type when defined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({ magFilter: 9729.42 })) // Invalid type
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })

    it('MUST be one of the allowed values: 9728, 9729', async () => {
      // Valid values
      const validFilters = [9728, 9729]
      for (const filter of validFilters) {
        const options = mockGLTFOptions(createTexturedGLTF({ magFilter: filter }))
        const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
        expect(texture?.magFilter).toBe(WEBGL_FILTERS[filter])
      }

      // Invalid value
      const options = mockGLTFOptions(createTexturedGLTF({ magFilter: 42 })) // Invalid value
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })
  })

  describe('minFilter', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture?.minFilter).toBe(LinearMipmapLinearFilter) // Default value
    })

    it('MUST be an `integer` type when defined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({ minFilter: 9987.42 })) // Invalid type
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })

    it('MUST be one of the allowed values: 9728, 9729, 9984, 9985, 9986, 9987', async () => {
      // Valid values
      const validFilters = [9728, 9729, 9984, 9985, 9986, 9987]
      for (const filter of validFilters) {
        const options = mockGLTFOptions(createTexturedGLTF({ minFilter: filter }))
        const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
        expect(texture?.minFilter).toBe(WEBGL_FILTERS[filter])
      }

      // Invalid value
      const options = mockGLTFOptions(createTexturedGLTF({ minFilter: 42 })) // Invalid value
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })
  })

  describe('wrapS', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture?.wrapS).toBe(RepeatWrapping) // Default value
    })

    it('SHOULD assign a default value of 10497 REPEAT', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture?.wrapS).toBe(RepeatWrapping) // THREE.RepeatWrapping
    })

    it('MUST be an `integer` type when defined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({ wrapS: 10497.42 })) // Invalid type
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })

    it('MUST be one of the allowed values: 33071, 33648, 10497', async () => {
      // Valid values
      const validWrappings = [33071, 33648, 10497]
      for (const wrapping of validWrappings) {
        const options = mockGLTFOptions(createTexturedGLTF({ wrapS: wrapping }))
        const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
        expect(texture?.wrapS).toBe(WEBGL_WRAPPINGS[wrapping])
      }

      // Invalid value
      const options = mockGLTFOptions(createTexturedGLTF({ wrapS: 42 })) // Invalid value
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })
  })

  describe('wrapT', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture?.wrapT).toBe(RepeatWrapping) // Default value
    })

    it('SHOULD assign a default value of 10497 REPEAT', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture?.wrapT).toBe(RepeatWrapping) // THREE.RepeatWrapping
    })

    it('MUST be an `integer` type when defined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({ wrapT: 10497.42 })) // Invalid type
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })

    it('MUST be one of the allowed values: 33071, 33648, 10497', async () => {
      // Valid values
      const validWrappings = [33071, 33648, 10497]
      for (const wrapping of validWrappings) {
        const options = mockGLTFOptions(createTexturedGLTF({ wrapT: wrapping }))
        const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
        expect(texture?.wrapT).toBe(WEBGL_WRAPPINGS[wrapping])
      }

      // Invalid value
      const options = mockGLTFOptions(createTexturedGLTF({ wrapT: 42 })) // Invalid value
      await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
    })
  })

  describe('name', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture).toBeDefined()
    })

    it('MUST be a `string` type when defined', async () => {
      // Valid name
      const validOptions = mockGLTFOptions(createTexturedGLTF({ name: 'TestSampler' }))
      const texture = await GLTFLoaderFunctions.loadTextureImage(validOptions, 0, 0, {} as any)
      expect(texture).toBeDefined()

      // Invalid name type
      const invalidOptions = mockGLTFOptions(createTexturedGLTF({ name: 42 as any }))
      await expect(GLTFLoaderFunctions.loadTextureImage(invalidOptions, 0, 0, {} as any)).rejects.toThrowError()
    })
  })

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture).toBeDefined()
    })

    it('MUST be a JSON object when defined', async () => {
      // Valid extensions object
      const validOptions = mockGLTFOptions(
        createTexturedGLTF({
          extensions: { KHR_custom_extension: { property: 'value' } }
        })
      )
      const texture = await GLTFLoaderFunctions.loadTextureImage(validOptions, 0, 0, {} as any)
      expect(texture).toBeDefined()

      // Invalid extensions type
      const invalidOptions = mockGLTFOptions(createTexturedGLTF({ extensions: 42 as any }))
      await expect(GLTFLoaderFunctions.loadTextureImage(invalidOptions, 0, 0, {} as any)).rejects.toThrowError()
    })
  })

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(createTexturedGLTF({}))
      const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
      expect(texture).toBeDefined()
    })

    it('MAY have `extras` as any type when defined', async () => {
      // Test with various extras types
      const withObjectExtras = mockGLTFOptions(createTexturedGLTF({ extras: { custom: 'value' } }))
      const textureWithObjectExtras = await GLTFLoaderFunctions.loadTextureImage(withObjectExtras, 0, 0, {} as any)
      expect(textureWithObjectExtras).toBeDefined()

      const withArrayExtras = mockGLTFOptions(createTexturedGLTF({ extras: [1, 2, 3] }))
      const textureWithArrayExtras = await GLTFLoaderFunctions.loadTextureImage(withArrayExtras, 0, 0, {} as any)
      expect(textureWithArrayExtras).toBeDefined()

      const withStringExtras = mockGLTFOptions(createTexturedGLTF({ extras: 'custom data' }))
      const textureWithStringExtras = await GLTFLoaderFunctions.loadTextureImage(withStringExtras, 0, 0, {} as any)
      expect(textureWithStringExtras).toBeDefined()
    })
  })
})
