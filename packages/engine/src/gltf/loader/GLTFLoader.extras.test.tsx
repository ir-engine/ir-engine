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
 * Unit Test suite for testing the `extras` property in glTF objects.
 * Based on glTF 2.0 specification requirements.
 * */
import { GLTF } from '@gltf-transform/core'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
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

const mockGLTFWithExtras = (extras: any): GLTF.IGLTF => {
  const gltf: GLTF.IGLTF = {
    asset: {
      version: '2.0'
    },
    extras: extras
  }
  return gltf
}

describe('glTF Extras Property', () => {
  it('MAY be undefined', async () => {
    const gltf = mockGLTFWithExtras(undefined)
    const options = mockGLTFOptions(gltf)

    await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
  })

  it('MAY contain any JSON value', async () => {
    const testCases = [
      { value: 'string value', description: 'string' },
      { value: 42, description: 'number' },
      { value: true, description: 'boolean' },
      { value: null, description: 'null' },
      { value: { key: 'value' }, description: 'object' },
      { value: [1, 2, 3], description: 'array' }
    ]

    for (const testCase of testCases) {
      const gltf = mockGLTFWithExtras(testCase.value)
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
    }
  })

  it('SHOULD be preserved during processing', async () => {
    const customData = {
      applicationName: 'TestApp',
      version: '1.0.0',
      metadata: {
        createdBy: 'Test User',
        createdAt: '2023-01-01'
      }
    }

    const gltf = mockGLTFWithExtras(customData)
    const options = mockGLTFOptions(gltf)

    await GLTFLoaderFunctions.loadScene(options, 0)

    expect(options.document.extras).toEqual(customData)
  })
})

describe('glTF Object Extras Properties', () => {
  it('MAY be present on any glTF object', async () => {
    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0',
        extras: { assetInfo: 'Asset extras' }
      },
      scenes: [
        {
          nodes: [0],
          extras: { sceneInfo: 'Scene extras' }
        }
      ],
      scene: 0,
      nodes: [
        {
          name: 'TestNode',
          extras: { nodeInfo: 'Node extras' }
        }
      ],
      materials: [
        {
          name: 'TestMaterial',
          extras: { materialInfo: 'Material extras' }
        }
      ],
      meshes: [
        {
          primitives: [],
          extras: { meshInfo: 'Mesh extras' }
        }
      ],
      cameras: [
        {
          type: 'perspective',
          extras: { cameraInfo: 'Camera extras' }
        }
      ],
      animations: [
        {
          channels: [],
          samplers: [],
          extras: { animationInfo: 'Animation extras' }
        }
      ],
      skins: [
        {
          joints: [],
          extras: { skinInfo: 'Skin extras' }
        }
      ],
      textures: [
        {
          sampler: 0,
          source: 0,
          extras: { textureInfo: 'Texture extras' }
        }
      ],
      samplers: [
        {
          magFilter: 9729,
          minFilter: 9987,
          wrapS: 10497,
          wrapT: 10497,
          extras: { samplerInfo: 'Sampler extras' }
        }
      ],
      images: [
        {
          uri: 'image.png',
          extras: { imageInfo: 'Image extras' }
        }
      ],
      buffers: [
        {
          uri: 'buffer.bin',
          byteLength: 1024,
          extras: { bufferInfo: 'Buffer extras' }
        }
      ],
      bufferViews: [
        {
          buffer: 0,
          byteOffset: 0,
          byteLength: 512,
          extras: { bufferViewInfo: 'BufferView extras' }
        }
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 3,
          type: 'VEC3',
          extras: { accessorInfo: 'Accessor extras' }
        }
      ],
      extensions: {
        customExtension: {
          extras: { extensionInfo: 'Extension extras' }
        }
      },
      extras: { documentInfo: 'Document extras' }
    }

    const options = mockGLTFOptions(gltf)
    await GLTFLoaderFunctions.loadScene(options, 0)

    expect(options.document.asset.extras).toEqual({ assetInfo: 'Asset extras' })
    expect(options.document.scenes?.[0].extras).toEqual({ sceneInfo: 'Scene extras' })
    expect(options.document.nodes?.[0].extras).toEqual({ nodeInfo: 'Node extras' })
    expect(options.document.materials?.[0].extras).toEqual({ materialInfo: 'Material extras' })
    expect(options.document.meshes?.[0].extras).toEqual({ meshInfo: 'Mesh extras' })
    expect(options.document.cameras?.[0].extras).toEqual({ cameraInfo: 'Camera extras' })
    expect(options.document.animations?.[0].extras).toEqual({ animationInfo: 'Animation extras' })
    expect(options.document.skins?.[0].extras).toEqual({ skinInfo: 'Skin extras' })
    expect(options.document.textures?.[0].extras).toEqual({ textureInfo: 'Texture extras' })
    expect(options.document.samplers?.[0].extras).toEqual({ samplerInfo: 'Sampler extras' })
    expect(options.document.images?.[0].extras).toEqual({ imageInfo: 'Image extras' })
    expect(options.document.buffers?.[0].extras).toEqual({ bufferInfo: 'Buffer extras' })
    expect(options.document.bufferViews?.[0].extras).toEqual({ bufferViewInfo: 'BufferView extras' })
    expect(options.document.accessors?.[0].extras).toEqual({ accessorInfo: 'Accessor extras' })
    expect(options.document.extras).toEqual({ documentInfo: 'Document extras' })
  })

  it('SHOULD handle deeply nested extras objects', async () => {
    const complexExtras = {
      level1: {
        level2: {
          level3: {
            data: [1, 2, 3],
            moreData: { a: 1, b: 2 }
          }
        },
        sibling: 'sibling value'
      },
      array: [{ item: 1 }, { item: 2 }]
    }

    const gltf = mockGLTFWithExtras(complexExtras)
    const options = mockGLTFOptions(gltf)

    await GLTFLoaderFunctions.loadScene(options, 0)

    expect(options.document.extras).toEqual(complexExtras)
  })
})
