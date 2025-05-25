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
 * Unit Test suite for loading the `glTF.skins` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { GLTF } from '@gltf-transform/core'
import { createEngine, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { act, render } from '@testing-library/react'
import { Bone, BoxGeometry, Matrix4, MeshBasicMaterial, Skeleton, SkinnedMesh } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
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

// Helper function to create a minimal valid GLTF with skins
const mockGLTFMinimalSkin = (): GLTF.IGLTF => {
  return {
    asset: {
      version: '2.0'
    },
    nodes: [{ name: 'root' }, { name: 'joint1' }, { name: 'joint2' }],
    skins: [
      {
        joints: [1, 2]
      }
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: 2,
        type: 'MAT4'
      }
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 128 // 2 matrices * 16 floats * 4 bytes
      }
    ],
    buffers: [
      {
        byteLength: 128,
        uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
      }
    ]
  }
}

describe('glTF.skins Property', () => {
  it('MAY be undefined', async () => {
    const gltf = mockGLTF()
    delete gltf.skins
    const options = mockGLTFOptions(gltf)

    // Should not throw when skins is undefined
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
  })

  it('MUST be an array of `skin` objects when defined', async () => {
    const gltf = mockGLTF()
    gltf.skins = {} as any // Not an array
    const options = mockGLTFOptions(gltf)

    // Should throw when skins is not an array
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).rejects.toThrow()
  })

  it('MUST have a length in range [1..] when defined', async () => {
    const gltf = mockGLTF()
    gltf.skins = [] // Empty array
    const options = mockGLTFOptions(gltf)

    // Should throw when skins array is empty but referenced
    gltf.nodes = [{ skin: 0 }] // Reference to non-existent skin
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).rejects.toThrow()
  })
}) //:: glTF.skins

describe('glTF: Skin Type', () => {
  describe('inverseBindMatrices', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFMinimalSkin()
      delete gltf.skins![0].inverseBindMatrices
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })
      gltf.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]

      // Should not throw when inverseBindMatrices is undefined
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).resolves.not.toThrow()
    })

    it('MUST interpret each matrix as an identity matrix when undefined', async () => {
      const gltf = mockGLTFMinimalSkin()
      delete gltf.skins![0].inverseBindMatrices
      const options = mockGLTFOptions(gltf)
      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })
      gltf.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]

      const skinnedMesh = new SkinnedMesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
      const bones = [new Bone()] as Bone[]
      const boneInverses = [new Matrix4(), new Matrix4(), new Matrix4()]
      const skeleton = new Skeleton(bones, boneInverses)
      skinnedMesh.skeleton = skeleton

      // Mock the necessary dependencies
      const nodeEntity = options.entity
      setComponent(nodeEntity, SkinnedMeshComponent, skinnedMesh)

      await GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)

      // Check that identity matrices were used
      const entityskinnedMesh = getComponent(nodeEntity, SkinnedMeshComponent)
      expect(entityskinnedMesh.skeleton.boneInverses.length).toBe(2)

      const identityMatrix = new Matrix4()
      entityskinnedMesh.skeleton.boneInverses.forEach((matrix) => {
        expect(matrix.equals(identityMatrix)).toBe(true)
      })
    })

    it('MUST be an `integer` type when defined', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].inverseBindMatrices = 1.5 // Not an integer
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when inverseBindMatrices is not an integer
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST be a value in range [0 .. glTF.accessors.length-1]', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].inverseBindMatrices = 5 // Out of range
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when inverseBindMatrices is out of range
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST reference an accessor with `count` equal to the length of the `joints` array', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].inverseBindMatrices = 0
      gltf.accessors![0].count = 1 // Not equal to joints.length (2)
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when accessor count doesn't match joints length
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })
  }) //:: inverseBindMatrices

  describe('skeleton', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFMinimalSkin()
      delete gltf.skins![0].skeleton
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })
      gltf.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]

      // Should not throw when skeleton is undefined
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).resolves.not.toThrow()
    })

    it('MUST be an `integer` type when defined', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].skeleton = 1.5 // Not an integer
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when skeleton is not an integer
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST be a value in range [0 .. glTF.nodes.length-1]', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].skeleton = 10 // Out of range
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when skeleton is out of range
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })
  }) //:: skeleton

  describe('joints', () => {
    it('MUST be defined', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].joints = undefined as any
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when joints is undefined
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST be an array of `integer` types', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].joints = [1, 2.5] as any // Not all integers
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when joints contains non-integers
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST have a length in range [1..]', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].joints = [] // Empty array
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when joints array is empty
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST have unique values', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].joints = [1, 1] // Duplicate values
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when joints contains duplicate values
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })

    it('MUST have values that are >= 0', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].joints = [-1, 2] // Negative value
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when joints contains negative values
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })
  }) //:: joints

  describe('name', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFMinimalSkin()
      delete gltf.skins![0].name
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })
      gltf.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]

      // Should not throw when name is undefined
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).resolves.not.toThrow()
    })

    it('MUST be a `string` type when defined', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].name = 42 as any // Not a string
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when name is not a string
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFMinimalSkin()
      delete gltf.skins![0].extensions
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })
      gltf.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]

      // Should not throw when extensions is undefined
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).resolves.not.toThrow()
    })

    it('MUST be a JSON object when defined', async () => {
      const gltf = mockGLTFMinimalSkin()
      gltf.skins![0].extensions = 42 as any // Not a JSON object
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })

      // Should throw when extensions is not a JSON object
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).rejects.toThrow()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFMinimalSkin()
      delete gltf.skins![0].extras
      const options = mockGLTFOptions(gltf)

      // Add a node that references the skin
      gltf.nodes!.push({ skin: 0, mesh: 0 })
      gltf.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]

      // Should not throw when extras is undefined
      await expect(GLTFLoaderFunctions.loadSkin(options, options.entity, 3)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Skin
