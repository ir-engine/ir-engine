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
 * Unit Test suite for loading the `glTF.meshes` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { GLTF } from '@gltf-transform/core'
import {
  createEngine,
  createEntity,
  destroyEngine,
  Entity,
  getComponent,
  hasComponent,
  setComponent
} from '@ir-engine/ecs'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { BufferGeometry } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(async () => {
  createEngine()
  startEngineReactor()
  await flushAll()
  DependencyCache.clear()
})

afterEach(() => {
  return destroyEngine()
})

const mockGLTFWithMeshes = (meshes: GLTF.IMesh[] = []): GLTF.IGLTF => {
  const gltf: GLTF.IGLTF = {
    asset: {
      version: '2.0'
    },
    meshes,

    nodes: meshes.map((_, index) => ({
      mesh: index
    }))
  }

  return gltf
}

const createMinimalMesh = (overrides: Partial<GLTF.IMesh> = {}): GLTF.IMesh => {
  return {
    primitives: [
      {
        attributes: {
          POSITION: 0
        }
      }
    ],
    ...overrides
  }
}

const createMinimalPrimitive = (overrides: Partial<GLTF.IMeshPrimitive> = {}): GLTF.IMeshPrimitive => {
  return {
    attributes: {
      POSITION: 0
    },
    ...overrides
  }
}

const setupEntity = (): Entity => {
  const entity = createEntity()
  return entity
}

describe('glTF.meshes Property', () => {
  it('MAY be undefined', async () => {
    const gltf = mockGLTFWithMeshes()
    delete gltf.meshes
    const options = mockGLTFOptions(gltf)

    await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
  })

  it('MUST be an array of `mesh` objects when defined', async () => {
    const gltf = mockGLTFWithMeshes()
    gltf.meshes = {} as any
    const options = mockGLTFOptions(gltf)

    await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
  })

  it('MUST have a length in range [1..] when defined', async () => {
    const gltf = mockGLTFWithMeshes([])
    const options = mockGLTFOptions(gltf)

    await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
  })
})

describe('glTF: Mesh Type', () => {
  describe('primitives', () => {
    it('MUST be defined', async () => {
      const mesh = createMinimalMesh()
      delete (mesh as any).primitives

      const gltf = mockGLTFWithMeshes([mesh])
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it('MUST be an array of `mesh.primitive` objects', async () => {
      const mesh = createMinimalMesh()
      mesh.primitives = {} as any

      const gltf = mockGLTFWithMeshes([mesh])
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it('MUST have a length in range [1..]', async () => {
      const mesh = createMinimalMesh({ primitives: [] })

      const gltf = mockGLTFWithMeshes([mesh])
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })

  describe('weights', () => {
    it('MAY be undefined', async () => {
      const mesh = createMinimalMesh()

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        const entity = setupEntity()

        await expect(GLTFLoaderFunctions.loadMesh(options, entity, 0, 0)).resolves.toBeDefined()

        expect(hasComponent(entity, MeshComponent)).toBe(true)
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be an array of `number` type when defined', async () => {
      const mesh = createMinimalMesh({ weights: ['invalid'] as any })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        geometry.morphTargetsRelative = true

        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST have a length equal to the number of morph targets defined in primitives', async () => {
      const mesh = createMinimalMesh({
        weights: [0.5, 0.5, 0.5],
        primitives: [
          {
            attributes: { POSITION: 0 },
            targets: [{ POSITION: 1 }]
          }
        ]
      })

      const gltf = mockGLTFWithMeshes([mesh])
      gltf.accessors = [
        { componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] },
        { componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }
      ]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })

  describe('name', () => {
    it('MAY be undefined', async () => {
      const mesh = createMinimalMesh()

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        const entity = setupEntity()

        await expect(GLTFLoaderFunctions.loadMesh(options, entity, 0, 0)).resolves.toBeDefined()

        const nameComponent = getComponent(entity, NameComponent)
        expect(nameComponent).toBeDefined()
        expect(nameComponent).toEqual('Mesh-0')
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be a `string` type when defined', async () => {
      const mesh = createMinimalMesh({ name: 123 as any })

      const gltf = mockGLTFWithMeshes([mesh])
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })
  })

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const mesh = createMinimalMesh({ extensions: {} })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be a JSON object when defined', async () => {
      const mesh = createMinimalMesh({ extensions: 'invalid' as any })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })
  })

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const mesh = createMinimalMesh()

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })
  })
})

describe('glTF: Mesh Primitive Type', () => {
  describe('attributes', () => {
    it('MUST be defined', async () => {
      const primitive = {} as GLTF.IMeshPrimitive

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it.todo('MUST be a JSON object', async () => {
      const primitive = createMinimalPrimitive()
      primitive.attributes = 'invalid' as any

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it.todo('MUST have `integer` values representing indices into the root `accessors` array', async () => {
      const primitive = createMinimalPrimitive({
        attributes: {
          POSITION: 0.5
        }
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })

  describe('material', () => {
    it('MAY be undefined', async () => {
      const primitive = createMinimalPrimitive()

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it('MUST be an `integer` type when defined', async () => {
      const primitive = createMinimalPrimitive({
        material: 0.5
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it('MUST have a value in range [0 .. glTF.materials.length-1] when defined', async () => {
      const primitive = createMinimalPrimitive({
        material: 999
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      gltf.materials = []

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })

  describe('mode', () => {
    it('MAY be undefined', async () => {
      const primitive = createMinimalPrimitive()

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be an `integer` type when defined', async () => {
      const primitive = createMinimalPrimitive({
        // @ts-expect-error
        mode: 4.5
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it.todo('MUST be one of the allowed values: 0-6', async () => {
      const primitive = createMinimalPrimitive({
        // @ts-expect-error
        mode: 7
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })

  describe('targets', () => {
    it('MAY be undefined', async () => {
      const primitive = createMinimalPrimitive()

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be an array of objects when defined', async () => {
      const primitive = createMinimalPrimitive({
        targets: 'invalid' as any
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const primitive = createMinimalPrimitive()

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be a JSON object when defined', async () => {
      const primitive = createMinimalPrimitive({ extensions: 'invalid' as any })
      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])

      gltf.nodes = [{ mesh: 0 }]
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })
  })
})

describe('glTF: Mesh Primitive Type', () => {
  describe('attributes', () => {
    it.todo('MUST contain the POSITION semantic', async () => {
      const primitive = createMinimalPrimitive()
      delete primitive.attributes.POSITION

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])
      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })

    it('MAY contain other semantics', async () => {
      const primitive = createMinimalPrimitive({
        attributes: {
          POSITION: 0,
          NORMAL: 1,
          TEXCOORD_0: 2
        }
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])
      gltf.accessors = [
        { componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] },
        { componentType: 5126, count: 3, type: 'VEC3' },
        { componentType: 5126, count: 3, type: 'VEC2' }
      ]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })
  })

  describe('indices', () => {
    it('MAY be undefined', async () => {
      const primitive = createMinimalPrimitive()

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      const originalLoadPrimitives = GLTFLoaderFunctions.loadPrimitives
      GLTFLoaderFunctions.loadPrimitives = async () => {
        const geometry = new BufferGeometry()
        const materialEntity = setupEntity()
        setComponent(materialEntity, MaterialStateComponent, { material: {} as any })
        return [geometry, [materialEntity]]
      }

      try {
        await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).resolves.toBeDefined()
      } finally {
        GLTFLoaderFunctions.loadPrimitives = originalLoadPrimitives
      }
    })

    it.todo('MUST be a valid accessor index when defined', async () => {
      const primitive = createMinimalPrimitive({
        indices: 999
      })

      const mesh = createMinimalMesh({
        primitives: [primitive]
      })

      const gltf = mockGLTFWithMeshes([mesh])
      gltf.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 1], min: [-1, -1, -1] }]
      gltf.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: 36 }]
      gltf.buffers = [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAA==' }]

      const options = mockGLTFOptions(gltf)

      await expect(GLTFLoaderFunctions.loadMesh(options, setupEntity(), 0, 0)).rejects.toThrow()
    })
  })
})
