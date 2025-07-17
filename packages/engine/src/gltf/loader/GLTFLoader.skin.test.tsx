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
import {
  createEngine,
  createEntity,
  destroyEngine,
  Entity,
  EntityID,
  getComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
  DependencyCache.clear()
})

overrideFileLoaderLoad()

beforeEach(async () => {
  createEngine()
  startEngineReactor()

  await flushAll()
})

afterEach(() => {
  destroyEngine()
})

const mockGLTFWithSkin = (skin: Partial<GLTF.ISkin> = {}): GLTF.IGLTF => {
  const accessor: GLTF.IAccessor = {
    componentType: 5126,
    count: 2,
    type: 'MAT4',
    bufferView: 0,
    byteOffset: 0
  }

  const bufferView: GLTF.IBufferView = {
    buffer: 0,
    byteOffset: 0,
    byteLength: 128
  }

  const buffer: GLTF.IBuffer = {
    byteLength: 128
  }

  const mesh: GLTF.IMesh = {
    primitives: [
      {
        attributes: {
          POSITION: 1,
          JOINTS_0: 2,
          WEIGHTS_0: 3
        }
      }
    ]
  }

  const posAccessor: GLTF.IAccessor = {
    componentType: 5126,
    count: 4,
    type: 'VEC3',
    bufferView: 1,
    byteOffset: 0,
    min: [-1, -1, -1],
    max: [1, 1, 1]
  }

  const jointsAccessor: GLTF.IAccessor = {
    componentType: 5123,
    count: 4,
    type: 'VEC4',
    bufferView: 2,
    byteOffset: 0
  }

  const weightsAccessor: GLTF.IAccessor = {
    componentType: 5126,
    count: 4,
    type: 'VEC4',
    bufferView: 3,
    byteOffset: 0
  }

  const nodes: GLTF.INode[] = [
    { name: 'Root' },
    { name: 'Joint1', children: [2] },
    { name: 'Joint2' },
    { name: 'Mesh', mesh: 0, skin: 0 }
  ]

  const defaultSkin: GLTF.ISkin = {
    joints: [1, 2],
    inverseBindMatrices: 0
  }

  const finalSkin = { ...defaultSkin, ...skin }

  return {
    asset: {
      version: '2.0'
    },
    skins: [finalSkin],
    nodes,
    meshes: [mesh],
    accessors: [accessor, posAccessor, jointsAccessor, weightsAccessor],
    bufferViews: [bufferView, bufferView, bufferView, bufferView],
    buffers: [buffer],
    scenes: [{ nodes: [0, 3] }],
    scene: 0
  }
}

const setupNodeEntity = (): Entity => {
  const source1 = createEntity()
  setComponent(source1, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '1' as EntityID })
  return source1
}

describe('glTF.skins Property', () => {
  it('MAY be undefined', async () => {
    const gltf = mockGLTFWithSkin()
    const options = mockGLTFOptions(gltf)
    delete options.document.skins

    await expect(GLTFLoaderFunctions.loadNode(options, 0)).resolves.not.toThrow()
  })

  it('MUST be an array of `skin` objects when defined', async () => {
    const gltf = mockGLTFWithSkin()
    const options = mockGLTFOptions(gltf)
    options.document.skins = {} as any

    const nodeEntity = setupNodeEntity()
    await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

    await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
  })

  it('MUST have a length in range [1..] when defined', async () => {
    const gltf = mockGLTFWithSkin()
    const options = mockGLTFOptions(gltf)
    options.document.skins = []

    const nodeEntity = setupNodeEntity()
    await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

    await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
  })
}) //:: glTF.skins

describe('glTF: Skin Type', () => {
  describe('inverseBindMatrices', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.inverseBindMatrices */
    it.todo('MAY be undefined', async () => {
      const gltf = mockGLTFWithSkin({ inverseBindMatrices: undefined })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).resolves.not.toThrow()
    })

    it.todo('MUST interpret each matrix as an identity matrix when undefined', async () => {
      const gltf = mockGLTFWithSkin({ inverseBindMatrices: undefined })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      const skinnedMesh = getComponent(nodeEntity, SkinnedMeshComponent)
      expect(skinnedMesh).toBeDefined()
      expect(skinnedMesh.skeleton.boneInverses.length).toBe(2)

      const isIdentity = skinnedMesh.skeleton.boneInverses.every((matrix) => {
        const elements = matrix.elements
        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        return elements.every((val, idx) => Math.abs(val - identity[idx]) < 0.0001)
      })

      expect(isIdentity).toBe(true)
    })

    it('MUST be an `integer` type when defined', async () => {
      const gltf = mockGLTFWithSkin({ inverseBindMatrices: 0.5 })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })

    it('MUST be a value in range [0 .. glTF.accessors.length-1', async () => {
      const gltf = mockGLTFWithSkin({ inverseBindMatrices: 99 })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.inverseBindMatrices.count */
    it.todo('MUST reference an accessor with `count` equal to the length of the `joints` array', async () => {
      const gltf = mockGLTFWithSkin()
      gltf.accessors![0].count = 1
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadNode(options, 3)).rejects.toThrow()
    })
  }) //:: inverseBindMatrices

  describe('skeleton', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFWithSkin({ skeleton: undefined })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.skeleton */
    it.todo('MUST be an `integer` type when defined', async () => {
      const gltf = mockGLTFWithSkin({ skeleton: 0.5 })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadNode(options, 3)).rejects.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.skeleton */
    it.todo('MUST be a value in range [0 .. glTF.nodes.length-1', async () => {
      const gltf = mockGLTFWithSkin({ skeleton: 99 })
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadNode(options, 3)).rejects.toThrow()
    })

    it('MUST reference the closest common root of the joints hierarchy or a direct/indirect parent node of the closest common root', async () => {
      const gltf = mockGLTFWithSkin({ skeleton: 0 })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).resolves.not.toThrow()
    })
  }) //:: skeleton

  describe('joints', () => {
    it('MUST be defined', async () => {
      const gltf = mockGLTFWithSkin()
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete gltf.skins![0].joints
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })

    it('MUST be an array of `integer` types', async () => {
      const gltf = mockGLTFWithSkin({ joints: [1.5, 2.5] as any })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.joints */
    it.todo('MUST have a length in range [1..]', async () => {
      const gltf = mockGLTFWithSkin({ joints: [] })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })

    it.todo('MUST have unique values', async () => {
      const gltf = mockGLTFWithSkin({ joints: [1, 1] })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })

    it('MUST have values that are >= 0', async () => {
      const gltf = mockGLTFWithSkin({ joints: [-1, 2] })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })
  }) //:: joints

  describe('name', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFWithSkin({ name: undefined })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.name */
    it.todo('MUST be a `string` type when defined', async () => {
      const gltf = mockGLTFWithSkin({ name: 42 as any })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFWithSkin({ extensions: undefined })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.skin.extensions */
    it.todo('MUST be a JSON object when defined', async () => {
      const gltf = mockGLTFWithSkin({ extensions: 42 as any })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).rejects.toThrow()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const gltf = mockGLTFWithSkin({ extras: undefined })
      const options = mockGLTFOptions(gltf)

      const nodeEntity = setupNodeEntity()
      await GLTFLoaderFunctions.loadMesh(options, nodeEntity, 3, 0)

      await expect(GLTFLoaderFunctions.loadSkin(options, nodeEntity, 3)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Skin
