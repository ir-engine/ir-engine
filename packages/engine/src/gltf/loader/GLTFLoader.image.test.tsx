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
 * Unit Test suite for loading the `glTF.images` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { GLTF } from '@gltf-transform/core'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { Texture } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

const MINIMAL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const MINIMAL_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=='

class MockTextureLoader {
  load(url, onLoad) {
    const texture = new Texture()
    texture.userData.src = url
    onLoad(texture)
    return texture
  }
  setRequestHeader() {}
}

function createImageGLTF(imageProps: Partial<GLTF.IImage> = {}): GLTF.IGLTF {
  const gltf = mockGLTF()
  gltf.images = [
    {
      uri: MINIMAL_PNG,
      ...imageProps
    }
  ]
  return gltf
}

beforeEach(async () => {
  DependencyCache.clear()
  createEngine()
  startEngineReactor()
  await flushAll()
})

afterEach(() => {
  destroyEngine()
})

overrideFileLoaderLoad()

describe('glTF.images Property', () => {
  it.todo('MAY be undefined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)
    delete options.document.images

    await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow(
      'Image 0 is missing URI and bufferView'
    )
  })

  it('MUST be an array of `image` objects when defined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)
    options.document.images = {} as any

    await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
  })

  it('MUST have a length in range [1..] when defined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)
    options.document.images = []

    await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
  })
}) //:: glTF.images

describe('glTF: Image Type', () => {
  describe('uri', () => {
    it('MAY be undefined', async () => {
      const gltf = createImageGLTF({ uri: undefined, bufferView: 0, mimeType: 'image/png' })
      const options = mockGLTFOptions(gltf)

      GLTFLoaderFunctions.loadBufferView = async () => new ArrayBuffer(8)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture).toBeDefined()
      expect(texture.userData.mimeType).toBe('image/png')
    })

    it.todo('MUST NOT be defined when `bufferView` is defined', async () => {
      const gltf = createImageGLTF({ uri: MINIMAL_PNG, bufferView: 0, mimeType: 'image/png' })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it('MUST be a `string` type when defined', async () => {
      const gltf = createImageGLTF({ uri: 42 as any })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it('MUST be a path relative to the glTF file when not absolute', async () => {
      const gltf = createImageGLTF({ uri: 'textures/test.png' })
      const options = mockGLTFOptions(gltf)
      options.path = 'http://example.com/models/'

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture.userData.src).toBe('http://example.com/models/textures/test.png')
    })

    it('MUST be base64 encoded when it starts with data:', async () => {
      const gltf = createImageGLTF({ uri: MINIMAL_PNG })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture.userData.src).toBe(MINIMAL_PNG)
      expect(texture.userData.mimeType).toBe('image/png')
    })

    it.todo('MUST match the image.mimeType when it starts with data:', async () => {
      const gltf = createImageGLTF({ uri: MINIMAL_PNG, mimeType: 'image/png' })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture.userData.mimeType).toBe('image/png')

      const invalidGltf = createImageGLTF({ uri: MINIMAL_PNG, mimeType: 'image/jpeg' })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(
        GLTFLoaderFunctions.loadImageSource(invalidOptions, 0, new MockTextureLoader() as any)
      ).rejects.toThrow()
    })
  }) //:: uri

  describe('mimeType', () => {
    it('MAY be undefined', async () => {
      const gltf = createImageGLTF({ mimeType: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture.userData.mimeType).toBe('image/png') // Should be inferred from URI
    })

    it.todo('MUST be a `string` type when defined', async () => {
      const gltf = createImageGLTF({ mimeType: 42 as any })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it('MUST be defined if `bufferView` is defined', async () => {
      const gltf = createImageGLTF({ uri: undefined, bufferView: 0, mimeType: undefined })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it.todo('MUST be undefined if `uri` is defined and not a data URI', async () => {
      const gltf = createImageGLTF({ uri: 'texture.png', mimeType: 'image/png' })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it.todo('MUST be defined if `uri` is a data URI)', async () => {
      const gltf = createImageGLTF({ uri: MINIMAL_PNG, mimeType: undefined })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it.todo('MUST be one of the allowed values: "image/jpeg" | "image/png"', async () => {
      const pngGltf = createImageGLTF({ uri: MINIMAL_PNG, mimeType: 'image/png' })
      const pngOptions = mockGLTFOptions(pngGltf)
      const pngTexture = await GLTFLoaderFunctions.loadImageSource(pngOptions, 0, new MockTextureLoader() as any)
      expect(pngTexture.userData.mimeType).toBe('image/png')

      const jpegGltf = createImageGLTF({ uri: MINIMAL_JPEG, mimeType: 'image/jpeg' })
      const jpegOptions = mockGLTFOptions(jpegGltf)
      const jpegTexture = await GLTFLoaderFunctions.loadImageSource(jpegOptions, 0, new MockTextureLoader() as any)
      expect(jpegTexture.userData.mimeType).toBe('image/jpeg')

      const invalidGltf = createImageGLTF({ uri: MINIMAL_PNG, mimeType: 'image/gif' })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(
        GLTFLoaderFunctions.loadImageSource(invalidOptions, 0, new MockTextureLoader() as any)
      ).rejects.toThrow()
    })
  }) //:: mimeType

  describe('bufferView', () => {
    it('MAY be undefined', async () => {
      const gltf = createImageGLTF({ bufferView: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture).toBeDefined()
    })

    it.todo('MUST NOT be defined when `uri` is defined', async () => {
      const gltf = createImageGLTF({ uri: MINIMAL_PNG, bufferView: 0, mimeType: 'image/png' })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it.todo('MUST be an `integer` type when defined', async () => {
      const gltf = createImageGLTF({ uri: undefined, bufferView: 0.5, mimeType: 'image/png' })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0 .. glTF.bufferViews.length-1]', async () => {
      const gltf = createImageGLTF({ uri: undefined, bufferView: 99, mimeType: 'image/png' })
      gltf.bufferViews = [{ byteLength: 10, byteOffset: 0, buffer: 0 }]
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)).rejects.toThrow()
    })

    it('MUST reference a bufferView containing valid PNG or JPEG image data', async () => {
      const originalLoadBufferView = GLTFLoaderFunctions.loadBufferView
      GLTFLoaderFunctions.loadBufferView = async () => {
        const buffer = new ArrayBuffer(8)
        const view = new Uint8Array(buffer)
        view[0] = 0x89
        view[1] = 0x50
        view[2] = 0x4e
        view[3] = 0x47
        return buffer
      }

      const gltf = createImageGLTF({ uri: undefined, bufferView: 0, mimeType: 'image/png' })
      gltf.bufferViews = [{ byteLength: 10, byteOffset: 0, buffer: 0 }]
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture).toBeDefined()

      GLTFLoaderFunctions.loadBufferView = originalLoadBufferView
    })
  }) //:: bufferView

  describe('name', () => {
    it('MAY be undefined', async () => {
      const gltf = createImageGLTF({ name: undefined })
      const options = mockGLTFOptions(gltf)

      const texture = await GLTFLoaderFunctions.loadImageSource(options, 0, new MockTextureLoader() as any)
      expect(texture).toBeDefined()
    })

    it.todo('MUST be a `string` type when defined', async () => {
      const validGltf = createImageGLTF({ name: 'TestImage' })
      const validOptions = mockGLTFOptions(validGltf)
      const texture = await GLTFLoaderFunctions.loadImageSource(validOptions, 0, new MockTextureLoader() as any)
      expect(texture).toBeDefined()

      const invalidGltf = createImageGLTF({ name: 42 as any })
      const invalidOptions = mockGLTFOptions(invalidGltf)

      await expect(
        GLTFLoaderFunctions.loadImageSource(invalidOptions, 0, new MockTextureLoader() as any)
      ).rejects.toThrow()
    })
  }) //:: name
}) //:: glTF: Image
