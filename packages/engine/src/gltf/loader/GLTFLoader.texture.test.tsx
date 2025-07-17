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
 * Unit Test suite for loading the `glTF.textures` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, Texture } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { overrideFileLoaderLoad, overrideTextureLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

const createTextureGLTF = (textureProps = {}, samplerProps = {}, imageProps = {}) => {
  const gltf = mockGLTF()
  gltf.images = [
    {
      uri: 'test-image.png',
      mimeType: 'image/png',
      ...imageProps
    }
  ]

  gltf.samplers = [
    {
      magFilter: 9729,
      minFilter: 9986,
      wrapS: 10497,
      wrapT: 10497,
      ...samplerProps
    }
  ]

  gltf.textures = [
    {
      sampler: 0,
      source: 0,
      ...textureProps
    }
  ]

  return gltf
}

overrideFileLoaderLoad()
overrideTextureLoaderLoad()

beforeEach(async () => {
  createEngine()
  startEngineReactor()

  vi.spyOn(GLTFLoaderFunctions, 'loadImageSource').mockImplementation(async () => {
    const texture = new Texture()
    texture.name = 'test-texture'
    return texture
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  destroyEngine()
})

describe('glTF.textures Property', () => {
  it.todo('MAY be undefined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)

    await expect(GLTFLoaderFunctions.loadTexture(options, 0)).not.toThrow()
  })

  it.todo('MUST be an array of `texture` objects when defined', async () => {
    const validGltf = createTextureGLTF()
    const validOptions = mockGLTFOptions(validGltf)

    const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
    expect(texture).toBeDefined()

    const invalidGltf = mockGLTF()
    invalidGltf.textures = {} as any
    const invalidOptions = mockGLTFOptions(invalidGltf)

    await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
  })

  it.todo('MUST have a length in range [1..] when defined', async () => {
    const validGltf = createTextureGLTF()
    const validOptions = mockGLTFOptions(validGltf)

    const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
    expect(texture).toBeDefined()

    const invalidGltf = mockGLTF()
    invalidGltf.textures = []
    const invalidOptions = mockGLTFOptions(invalidGltf)

    await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
  })
})

describe('glTF: Texture Type', () => {
  describe('sampler', () => {
    it('MAY be undefined', async () => {
      const gltf = createTextureGLTF({ sampler: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()

      expect(texture?.wrapS).toBe(RepeatWrapping)
      expect(texture?.wrapT).toBe(RepeatWrapping)
      expect(texture?.magFilter).toBe(LinearFilter)
      expect(texture?.minFilter).toBe(LinearMipmapLinearFilter)
    })

    it('SHOULD use a sampler with repeat wrapping and auto-filtering when undefined', async () => {
      const gltf = createTextureGLTF({ sampler: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()

      expect(texture?.wrapS).toBe(RepeatWrapping)
      expect(texture?.wrapT).toBe(RepeatWrapping)
      expect(texture?.magFilter).toBe(LinearFilter)
      expect(texture?.minFilter).toBe(LinearMipmapLinearFilter)
    })

    it.todo('MUST be an `integer` type when defined', async () => {
      const validGltf = createTextureGLTF({ sampler: 0 })
      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({ sampler: 0.5 })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0 .. glTF.samplers.length-1]', async () => {
      const validGltf = createTextureGLTF({ sampler: 0 })
      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({ sampler: 1 })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })
  })

  describe('source', () => {
    it('MAY be undefined (if using certain extensions)', async () => {
      const gltf = createTextureGLTF({
        source: undefined,
        extensions: {
          KHR_texture_basisu: {
            source: 0
          }
        }
      })

      gltf.extensionsUsed = ['KHR_texture_basisu']

      const options = mockGLTFOptions(gltf)

      vi.spyOn(GLTFLoaderFunctions, 'loadImageSource').mockImplementation(async () => {
        const texture = new Texture()
        texture.name = 'ktx2-texture'
        return texture
      })

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()
    })

    it.todo('SHOULD supply an alternate texture source when undefined (eg. from an extension)', async () => {
      const gltf = createTextureGLTF({
        source: undefined,
        extensions: {
          KHR_texture_basisu: {
            source: 0
          }
        }
      })

      gltf.extensionsUsed = ['KHR_texture_basisu']

      const options = mockGLTFOptions(gltf)

      vi.spyOn(GLTFLoaderFunctions, 'loadImageSource').mockImplementation(async () => {
        const texture = new Texture()
        texture.name = 'ktx2-texture'
        return texture
      })

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()
      expect(texture?.name).toBe('ktx2-texture')
    })

    it.todo('MUST be an `integer` type when defined', async () => {
      const validGltf = createTextureGLTF({ source: 0 })
      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({ source: 0.5 })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0 .. glTF.images.length-1]', async () => {
      const validGltf = createTextureGLTF({ source: 0 })
      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({ source: 1 })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })
  })

  describe('name', () => {
    it('MAY be undefined', async () => {
      const gltf = createTextureGLTF({ name: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()

      expect(texture?.name).toBe('test-image.png')
    })

    it.todo('MUST be a `string` type when defined', async () => {
      const validGltf = createTextureGLTF({ name: 'TestTexture' })
      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()
      expect(texture?.name).toBe('TestTexture')

      const invalidGltf = createTextureGLTF({ name: 42 as any })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })
  })

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const gltf = createTextureGLTF({ extensions: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()
    })

    it.todo('MUST be a JSON object when defined', async () => {
      const validGltf = createTextureGLTF({
        extensions: {
          KHR_texture_basisu: { source: 0 }
        }
      })

      validGltf.extensionsUsed = ['KHR_texture_basisu']

      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({ extensions: 42 as any })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })

    it.todo('MUST contain valid extension properties if defined (e.g., KHR_texture_basisu source index)', async () => {
      const validGltf = createTextureGLTF({
        extensions: {
          KHR_texture_basisu: { source: 0 }
        }
      })

      validGltf.extensionsUsed = ['KHR_texture_basisu']

      const validOptions = mockGLTFOptions(validGltf)

      vi.spyOn(GLTFLoaderFunctions, 'loadImageSource').mockImplementation(async () => {
        const texture = new Texture()
        texture.name = 'ktx2-texture'
        return texture
      })

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({
        extensions: {
          KHR_texture_basisu: {}
        }
      })

      invalidGltf.extensionsUsed = ['KHR_texture_basisu']

      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })
  })

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const gltf = createTextureGLTF({ extras: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
      expect(texture).toBeDefined()
    })

    it.todo('MUST be a JSON object when defined', async () => {
      const validGltf = createTextureGLTF({ extras: { custom: 'data' } })
      const validOptions = mockGLTFOptions(validGltf)

      const texture = await GLTFLoaderFunctions.loadTexture(validOptions, 0)
      expect(texture).toBeDefined()

      const invalidGltf = createTextureGLTF({ extras: 42 as any })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadTexture(invalidOptions, 0)).rejects.toThrow()
    })
  })
})

describe('Texture Loading Behavior', () => {
  it('should set flipY to false for all textures', async () => {
    const gltf = createTextureGLTF()
    const options = mockGLTFOptions(gltf)

    const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
    expect(texture).toBeDefined()
    expect(texture?.flipY).toBe(false)
  })

  it('should set texture name from texture definition, image name, or URI', async () => {
    const textureNameGltf = createTextureGLTF({ name: 'TextureName' })
    const textureNameOptions = mockGLTFOptions(textureNameGltf)

    const textureWithName = await GLTFLoaderFunctions.loadTexture(textureNameOptions, 0)
    expect(textureWithName?.name).toBe('TextureName')

    const imageNameGltf = createTextureGLTF({ name: undefined }, {}, { name: 'ImageName' })
    const imageNameOptions = mockGLTFOptions(imageNameGltf)

    const textureWithImageName = await GLTFLoaderFunctions.loadTexture(imageNameOptions, 0)
    expect(textureWithImageName?.name).toBe('ImageName')

    const uriGltf = createTextureGLTF({ name: undefined }, {}, { name: undefined })
    const uriOptions = mockGLTFOptions(uriGltf)

    const textureWithUri = await GLTFLoaderFunctions.loadTexture(uriOptions, 0)
    expect(textureWithUri?.name).toBe('test-image.png')
  })

  it.todo('should apply sampler properties to the texture', async () => {
    const gltf = createTextureGLTF(
      {},
      {
        magFilter: 9729,
        minFilter: 9986,
        wrapS: 10497,
        wrapT: 10497
      }
    )

    const options = mockGLTFOptions(gltf)

    const texture = await GLTFLoaderFunctions.loadTexture(options, 0)
    expect(texture).toBeDefined()

    expect(texture?.magFilter).toBe(9729)
    expect(texture?.minFilter).toBe(9986)
    expect(texture?.wrapS).toBe(10497)
    expect(texture?.wrapT).toBe(10497)
  })
})
