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
 * Unit Test suite for loading the `glTF.materials` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { GLTF } from '@gltf-transform/core'
import { createEngine, destroyEngine, Entity, getComponent, hasComponent } from '@ir-engine/ecs'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { DoubleSide, FrontSide, MeshStandardMaterial, SRGBColorSpace } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'
import { KHRUnlitExtensionComponent } from '../MaterialExtensionComponents'

const MINIMAL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

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

function createMaterialGLTF(materialProps: Partial<GLTF.IMaterial> = {}): GLTF.IGLTF {
  const gltf = mockGLTF()

  gltf.materials = [
    {
      name: 'TestMaterial',
      ...materialProps
    }
  ]

  return gltf
}

function createTexturedMaterialGLTF(materialProps: Partial<GLTF.IMaterial> = {}): GLTF.IGLTF {
  const gltf = createMaterialGLTF(materialProps)

  gltf.images = [
    {
      uri: MINIMAL_PNG
    }
  ]

  gltf.textures = [
    {
      source: 0
    }
  ]

  return gltf
}

async function loadTestMaterial(gltf: GLTF.IGLTF, materialIndex = 0): Promise<Entity> {
  const options = mockGLTFOptions(gltf)
  return GLTFLoaderFunctions.loadMaterial(options, materialIndex)
}

describe('glTF.materials Property', () => {
  it('MAY be undefined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)
    delete options.document.materials

    await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
  })

  it('MUST be an array of `material` objects when defined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)
    options.document.materials = 42 as any

    await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
  })

  it('MUST have a length in range [1..] when defined', async () => {
    const gltf = mockGLTF()
    const options = mockGLTFOptions(gltf)
    options.document.materials = []

    await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
  })
})

describe('glTF: Material Type', () => {
  describe('name', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ name: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material
      expect(material.name).toMatch(/^Material-\d+$/)
    })

    it.todo('MUST be a `string` type when defined', async () => {
      const validGltf = createMaterialGLTF({ name: 'TestMaterial' })
      const materialEntity = await loadTestMaterial(validGltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material
      expect(material.name).toBe('TestMaterial')

      const invalidGltf = createMaterialGLTF({ name: 42 as any })
      const options = mockGLTFOptions(invalidGltf)

      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })

  describe('pbrMetallicRoughness', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material).toBeDefined()
      expect(material.metalness).toBe(1.0)
      expect(material.roughness).toBe(1.0)
    })

    it('MUST apply all the default values of PBR when undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.color.getHexString()).toBe('ffffff')
      expect(material.metalness).toBe(1.0)
      expect(material.roughness).toBe(1.0)
      expect(material.map).toBeNull()
    })

    it.todo('MUST be a `pbrMetallicRoughness` type object when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, 0.5, 0.5, 1.0],
          metallicFactor: 0.5,
          roughnessFactor: 0.7
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.metalness).toBe(0.5)
      expect(material.roughness).toBe(0.7)

      const invalidGltf = createMaterialGLTF({
        pbrMetallicRoughness: 42 as any
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })

  describe('normalTexture', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ normalTexture: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.normalMap).toBeNull()
    })

    it('MUST interpret the material as not having a normal texture when undefined', async () => {
      const gltf = createMaterialGLTF({ normalTexture: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.normalMap).toBeNull()
    })

    it('MUST be a `NormalTextureInfo` type object when defined', async () => {
      const gltf = createTexturedMaterialGLTF({
        normalTexture: {
          index: 0,
          scale: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.normalMap).toBeDefined()
      expect(material.normalScale.x).toBe(0.5)
      expect(material.normalScale.y).toBe(0.5)

      const invalidGltf = createTexturedMaterialGLTF({
        normalTexture: 42 as any
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })

  describe('occlusionTexture', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ occlusionTexture: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeNull()
    })

    it('MUST interpret the material as not having an occlussion texture when undefined', async () => {
      const gltf = createMaterialGLTF({ occlusionTexture: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeNull()
    })

    it('MUST be an `OcclusionTextureInfo` type object when defined', async () => {
      const gltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 0.7
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.aoMap).toBeDefined()
      expect(material.aoMapIntensity).toBe(0.7)

      const invalidGltf = createTexturedMaterialGLTF({
        occlusionTexture: 42 as any
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })

  describe('emissiveTexture', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ emissiveTexture: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeNull()
    })

    it('MUST be a `TextureInfo` type object when defined', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: 42 as any
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST contain RGB components encoded as sRGB', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.emissiveMap).toBeDefined()
      expect(material.emissiveMap?.colorSpace).toBe(SRGBColorSpace)
    })

    it('MUST ignore a fourth component (A) when present', () => {})
  })

  describe('emissiveFactor', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ emissiveFactor: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissive.r).toBe(0)
      expect(material.emissive.g).toBe(0)
      expect(material.emissive.b).toBe(0)
    })

    it('SHOULD assign a default value of [0.0, 0.0, 0.0]', async () => {
      const gltf = createMaterialGLTF({ emissiveFactor: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissive.r).toBe(0)
      expect(material.emissive.g).toBe(0)
      expect(material.emissive.b).toBe(0)
    })

    it.todo('MUST be an array[3] of `number` type when defined', async () => {
      const validGltf = createMaterialGLTF({
        emissiveFactor: [0.5, 0.7, 0.9]
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.emissive.r).toBeCloseTo(0.5)
      expect(material.emissive.g).toBeCloseTo(0.7)
      expect(material.emissive.b).toBeCloseTo(0.9)

      const invalidLengthGltf = createMaterialGLTF({
        emissiveFactor: [0.5, 0.7, 0.9, 1.0] as any
      })

      const invalidLengthOptions = mockGLTFOptions(invalidLengthGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(invalidLengthOptions, 0)).rejects.toThrow()

      const invalidTypeGltf = createMaterialGLTF({
        emissiveFactor: [0.5, '0.7', 0.9] as any
      })

      const invalidTypeOptions = mockGLTFOptions(invalidTypeGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(invalidTypeOptions, 0)).rejects.toThrow()
    })

    it.todo('MUST have values in range [0.0..1.0] when defined', async () => {
      const validGltf = createMaterialGLTF({
        emissiveFactor: [0.0, 0.5, 1.0]
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.emissive.r).toBe(0.0)
      expect(material.emissive.g).toBe(0.5)
      expect(material.emissive.b).toBe(1.0)

      const invalidGltf = createMaterialGLTF({
        emissiveFactor: [-0.5, 0.5, 1.5]
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST interpret each value as a multiplier for the texels sampled from .emissiveTexture', () => {})
  })

  describe('alphaMode', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ alphaMode: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.transparent).toBe(false)
      expect(material.alphaTest).toBe(0)
    })

    it('SHOULD assign a default value of "OPAQUE"', async () => {
      const gltf = createMaterialGLTF({ alphaMode: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.transparent).toBe(false)
      expect(material.alphaTest).toBe(0)
    })

    it.todo('MUST be a `string` type when defined', async () => {
      const validGltf = createMaterialGLTF({ alphaMode: 'MASK' })
      const materialEntity = await loadTestMaterial(validGltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.alphaTest).toBe(0.5)

      const invalidGltf = createMaterialGLTF({ alphaMode: 42 as any })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo('MUST be one of the allowed values: "OPAQUE" | "MASK" | "BLEND"', async () => {
      const opaqueGltf = createMaterialGLTF({ alphaMode: 'OPAQUE' })
      const opaqueMaterialEntity = await loadTestMaterial(opaqueGltf)

      const opaqueMaterial = getComponent(opaqueMaterialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(opaqueMaterial.transparent).toBe(false)
      expect(opaqueMaterial.alphaTest).toBe(0)

      const maskGltf = createMaterialGLTF({ alphaMode: 'MASK' })
      const maskMaterialEntity = await loadTestMaterial(maskGltf)

      const maskMaterial = getComponent(maskMaterialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(maskMaterial.transparent).toBe(false)
      expect(maskMaterial.alphaTest).toBe(0.5)

      const blendGltf = createMaterialGLTF({ alphaMode: 'BLEND' })
      const blendMaterialEntity = await loadTestMaterial(blendGltf)

      const blendMaterial = getComponent(blendMaterialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(blendMaterial.transparent).toBe(true)
      expect(blendMaterial.depthWrite).toBe(false)

      const invalidGltf = createMaterialGLTF({ alphaMode: 'INVALID_MODE' as any })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it("MUST ignore the alpha value of the material's base color when OPAQUE", async () => {
      const gltf = createMaterialGLTF({
        alphaMode: 'OPAQUE',
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 0.5]
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.transparent).toBe(false)
      expect(material.opacity).toBe(0.5)
    })

    it('MUST render the output as fully opaque/transparent depending on the alpha and alphaCutoff values when MASK', async () => {
      const gltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: 0.75,
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 0.5]
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.transparent).toBe(false)
      expect(material.alphaTest).toBe(0.75)
      expect(material.opacity).toBe(0.5)
    })

    it('MUST combine the source/destination into the output using a composite operator when BLEND', async () => {
      const gltf = createMaterialGLTF({
        alphaMode: 'BLEND',
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 0.5]
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.transparent).toBe(true)
      expect(material.depthWrite).toBe(false)
      expect(material.opacity).toBe(0.5)
    })
  })

  describe('alphaCutoff', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: undefined
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.alphaTest).toBe(0.5)
    })

    it('SHOULD assign a default value of 0.5', async () => {
      const gltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: undefined
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.alphaTest).toBe(0.5)
    })

    it('MUST be ignored for .alphaMode other than MASK', async () => {
      const opaqueGltf = createMaterialGLTF({
        alphaMode: 'OPAQUE',
        alphaCutoff: 0.75
      })

      const opaqueMaterialEntity = await loadTestMaterial(opaqueGltf)
      const opaqueMaterial = getComponent(opaqueMaterialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(opaqueMaterial.alphaTest).toBe(0)

      const blendGltf = createMaterialGLTF({
        alphaMode: 'BLEND',
        alphaCutoff: 0.75
      })

      const blendMaterialEntity = await loadTestMaterial(blendGltf)
      const blendMaterial = getComponent(blendMaterialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(blendMaterial.alphaTest).toBe(0)
    })

    it('MUST NOT be defined when .alphaMode is undefined', async () => {
      const gltf = createMaterialGLTF({
        alphaMode: undefined,
        alphaCutoff: 0.75
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.alphaTest).toBe(0)
    })

    it.todo('MUST be a `number` type when defined', async () => {
      const validGltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: 0.75
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.alphaTest).toBe(0.75)

      const invalidGltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: '0.75' as any
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0.0..1.0] when defined', async () => {
      const validGltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: 0.75
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.alphaTest).toBe(0.75)

      const invalidGltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: 1.5
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST only apply if `alphaMode` is "MASK"', async () => {
      const gltf = createMaterialGLTF({
        alphaMode: 'MASK',
        alphaCutoff: 0.75
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.alphaTest).toBe(0.75)
    })
  })

  describe('doubleSided', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ doubleSided: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.side).toBe(FrontSide)
    })

    it('SHOULD assign a default value of false', async () => {
      const gltf = createMaterialGLTF({ doubleSided: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.side).toBe(FrontSide)
    })

    it.todo('MUST be a `boolean` type when defined', async () => {
      const validGltf = createMaterialGLTF({ doubleSided: true })
      const materialEntity = await loadTestMaterial(validGltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.side).toBe(DoubleSide)

      const invalidGltf = createMaterialGLTF({ doubleSided: 42 as any })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('SHOULD enable back-face culling when true', async () => {
      const gltf = createMaterialGLTF({ doubleSided: true })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.side).toBe(DoubleSide)
    })

    it('MUST reverse the back-face normals before lighting is evaluated', async () => {
      const gltf = createMaterialGLTF({ doubleSided: true })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.side).toBe(DoubleSide)
    })
  })

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ extensions: undefined })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.userData.extensions).toBeUndefined()
    })

    it('MUST be a JSON object when defined', async () => {
      const gltf = createMaterialGLTF({ extensions: { KHR_materials_unlit: {} } })
      gltf.extensionsUsed = ['KHR_materials_unlit']
      const materialEntity = await loadTestMaterial(gltf)

      expect(hasComponent(materialEntity, KHRUnlitExtensionComponent)).toBe(true)
    })
  })
})

describe('glTF: PBRMetallicRoughness Type', () => {
  describe('baseColorFactor', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { baseColorFactor: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.color.getHexString()).toBe('ffffff')
    })

    it('SHOULD assign a default value of [1.0, 1.0, 1.0, 1.0]', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { baseColorFactor: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.color.getHexString()).toBe('ffffff')
    })

    it.todo('MUST be an array[4] of `number` type when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, 0.5, 0.5, 1.0]
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.color.r).toBeCloseTo(0.5)
      expect(material.color.g).toBeCloseTo(0.5)
      expect(material.color.b).toBeCloseTo(0.5)
      expect(material.opacity).toBe(1.0)

      const invalidLengthGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, 0.5, 0.5] as any
        }
      })

      const invalidLengthOptions = mockGLTFOptions(invalidLengthGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(invalidLengthOptions, 0)).rejects.toThrow()

      const invalidTypeGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, '0.5', 0.5, 1.0] as any
        }
      })

      const invalidTypeOptions = mockGLTFOptions(invalidTypeGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(invalidTypeOptions, 0)).rejects.toThrow()
    })

    it.todo('MUST have values in range [0.0..1.0] when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorFactor: [0.0, 0.5, 1.0, 0.8]
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.color.r).toBe(0.0)
      expect(material.color.g).toBe(0.5)
      expect(material.color.b).toBe(1.0)
      expect(material.opacity).toBe(0.8)

      const invalidGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorFactor: [-0.5, 0.5, 1.5, 1.5]
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST interpret the values as linear multipliers for the sampled texels of the .baseColorTexture', () => {})
  })

  describe('baseColorTexture', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { baseColorTexture: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.map).toBeNull()
    })

    it('MUST sample the texture with 1.0 for all components when undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { baseColorTexture: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.map).toBeNull()
    })

    it('MUST be a `TextureInfo` type object when defined', async () => {
      const gltf = createTexturedMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorTexture: {
            index: 0
          }
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.map).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorTexture: 42 as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST contain RGB components encoded as sRGB', async () => {
      const gltf = createTexturedMaterialGLTF({
        pbrMetallicRoughness: {
          baseColorTexture: {
            index: 0
          }
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.map).toBeDefined()
      expect(material.map?.colorSpace).toBe(SRGBColorSpace)
    })

    it("MUST contain the alpha channel when the material's alphaMode is not OPAQUE", async () => {})
  })

  describe('metallicFactor', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { metallicFactor: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.metalness).toBe(1.0)
    })

    it('SHOULD assign a default value of 1.0', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { metallicFactor: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.metalness).toBe(1.0)
    })

    it.todo('MUST be a `number` type when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          metallicFactor: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.metalness).toBe(0.5)

      const invalidGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          metallicFactor: '0.5' as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0.0..1.0] when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          metallicFactor: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.metalness).toBe(0.5)

      const invalidGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          metallicFactor: 1.5
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST interpret the value as a linear multiplier for the sampled texels of the .metallicRoughnessTexture', () => {})
  })

  describe('roughnessFactor', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { roughnessFactor: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.roughness).toBe(1.0)
    })

    it('SHOULD assign a default value of 1.0', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { roughnessFactor: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.roughness).toBe(1.0)
    })

    it.todo('MUST be a `number` type when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          roughnessFactor: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.roughness).toBe(0.5)

      const invalidGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          roughnessFactor: '0.5' as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0.0..1.0] when defined', async () => {
      const validGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          roughnessFactor: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.roughness).toBe(0.5)

      const invalidGltf = createMaterialGLTF({
        pbrMetallicRoughness: {
          roughnessFactor: 1.5
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST interpret the value as a linear multiplier for the sampled texels of the .metallicRoughnessTexture', () => {})
  })

  describe('metallicRoughnessTexture', () => {
    it('MAY be undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { metallicRoughnessTexture: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.metalnessMap).toBeNull()
      expect(material.roughnessMap).toBeNull()
    })

    it('MUST sample the texture with 1.0 for all components when undefined', async () => {
      const gltf = createMaterialGLTF({ pbrMetallicRoughness: { metallicRoughnessTexture: undefined } })
      const materialEntity = await loadTestMaterial(gltf)

      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.metalnessMap).toBeNull()
      expect(material.roughnessMap).toBeNull()
    })

    it('MUST be a `TextureInfo` type object when defined', async () => {
      const gltf = createTexturedMaterialGLTF({
        pbrMetallicRoughness: {
          metallicRoughnessTexture: {
            index: 0
          }
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial

      expect(material.metalnessMap).toBeDefined()
      expect(material.roughnessMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        pbrMetallicRoughness: {
          metallicRoughnessTexture: 42 as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })
})

/**
 * @note
 * Treat the TextureInfo as a base type.
 * These tests also apply to all "derived" types
 * */
describe('glTF: TextureInfo Type', () => {
  describe('index', () => {
    it('MUST be defined', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {} as any
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST be an `integer` type', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0.5
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST be an index into the root `textures` array', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()
    })

    it('MUST have a value in range [0 .. glTF.textures.length-1]', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 1
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })

  describe('texCoord', () => {
    it('MAY be undefined', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: undefined
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()
    })

    it('SHOULD assign a default value of 0', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: undefined
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()
    })

    it.todo('MUST be an `integer` type when defined', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: 1
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: 0.5
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0..]', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: 0
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: -1
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST correspond to the TEXCOORD_<N> attribute key in mesh.primitives.attributes', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          texCoord: 0
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()
    })
  })

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          extensions: undefined
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()
    })

    it.todo('MUST be a JSON object when defined', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          extensions: {
            KHR_texture_transform: {
              offset: [0.5, 0.5],
              rotation: 0.0,
              scale: [2.0, 2.0]
            }
          }
        }
      })

      validGltf.extensionsUsed = ['KHR_texture_transform']

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          extensions: 42 as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo(
      'MUST contain valid extension properties if defined (e.g., KHR_texture_transform offset/rotation/scale)',
      async () => {
        const validGltf = createTexturedMaterialGLTF({
          emissiveTexture: {
            index: 0,
            extensions: {
              KHR_texture_transform: {
                offset: [0.5, 0.5],
                rotation: 0.0,
                scale: [2.0, 2.0]
              }
            }
          }
        })

        validGltf.extensionsUsed = ['KHR_texture_transform']

        const materialEntity = await loadTestMaterial(validGltf)
        const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
        expect(material.emissiveMap).toBeDefined()

        const invalidGltf = createTexturedMaterialGLTF({
          emissiveTexture: {
            index: 0,
            extensions: {
              KHR_texture_transform: {
                offset: 0.5 as any,
                rotation: 0.0,
                scale: [2.0, 2.0]
              }
            }
          }
        })

        invalidGltf.extensionsUsed = ['KHR_texture_transform']

        const options = mockGLTFOptions(invalidGltf)
        await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
      }
    )
  })

  describe('extras', () => {
    it('MAY be undefined', async () => {
      const gltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          extras: undefined
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()
    })

    it.todo('MUST be a JSON object when defined', async () => {
      const validGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          extras: { custom: 'data' }
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.emissiveMap).toBeDefined()

      const invalidGltf = createTexturedMaterialGLTF({
        emissiveTexture: {
          index: 0,
          extras: 42 as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })
  })
})

describe('glTF: NormalTextureInfo Type', () => {
  describe('inherit properties from TextureInfo', () => {
    it('MUST include all TextureInfo properties', async () => {
      const gltf = createTexturedMaterialGLTF({
        normalTexture: {
          index: 0,
          texCoord: 1,
          extensions: { custom: {} },
          extras: { data: 'value' }
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.normalMap).toBeDefined()
    })
  })

  describe('scale', () => {
    it.todo('MUST be a `number` type when defined', async () => {
      const validGltf = createTexturedMaterialGLTF({
        normalTexture: {
          index: 0,
          scale: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.normalMap).toBeDefined()
      expect(material.normalScale.x).toBe(0.5)
      expect(material.normalScale.y).toBe(0.5)

      const invalidGltf = createTexturedMaterialGLTF({
        normalTexture: {
          index: 0,
          scale: '0.5' as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST scale each normal vector of the texture using the formula: scaledNormal = normalize<sampled normal texture value> * 2.0 - 1.0) * vec3(<normal scale>, <normal scale>, 1.0)', async () => {
      const gltf = createTexturedMaterialGLTF({
        normalTexture: {
          index: 0,
          scale: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.normalMap).toBeDefined()
      expect(material.normalScale.x).toBe(0.5)
      expect(material.normalScale.y).toBe(0.5)
    })
  })
})

describe('glTF: OcclusionTextureInfo Type', () => {
  describe('inherit properties from TextureInfo', () => {
    it('MUST include all TextureInfo properties', async () => {
      const gltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          texCoord: 1,
          extensions: { custom: {} },
          extras: { data: 'value' }
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()
    })
  })

  describe('strength', () => {
    it('MAY be undefined', async () => {
      const gltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: undefined
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()
      expect(material.aoMapIntensity).toBe(1.0)
    })

    it('SHOULD assign a default value of 1.0', async () => {
      const gltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: undefined
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()
      expect(material.aoMapIntensity).toBe(1.0)
    })

    it.todo('MUST be a `number` type when defined', async () => {
      const validGltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 0.7
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()
      expect(material.aoMapIntensity).toBe(0.7)

      const invalidGltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: '0.7' as any
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it.todo('MUST have a value in range [0.0..1.0] when defined', async () => {
      const validGltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 0.7
        }
      })

      const materialEntity = await loadTestMaterial(validGltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()
      expect(material.aoMapIntensity).toBe(0.7)

      const invalidGltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 1.5
        }
      })

      const options = mockGLTFOptions(invalidGltf)
      await expect(GLTFLoaderFunctions.loadMaterial(options, 0)).rejects.toThrow()
    })

    it('MUST render no occlusion when 0.0, and full occlusion when 1.0', async () => {
      const gltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 0.0
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()
      expect(material.aoMapIntensity).toBe(0.0)

      const gltfFullOcclusion = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 1.0
        }
      })

      const materialFullOcclusionEntity = await loadTestMaterial(gltfFullOcclusion)
      const materialFullOcclusion = getComponent(materialFullOcclusionEntity, MaterialStateComponent)
        .material as MeshStandardMaterial
      expect(materialFullOcclusion.aoMap).toBeDefined()
      expect(materialFullOcclusion.aoMapIntensity).toBe(1.0)
    })

    it('MUST modify the final occlusion value with the formula: 1.0 + strength * (<sampled occlusion texture value> - 1.0)', async () => {
      const gltf = createTexturedMaterialGLTF({
        occlusionTexture: {
          index: 0,
          strength: 0.5
        }
      })

      const materialEntity = await loadTestMaterial(gltf)
      const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
      expect(material.aoMap).toBeDefined()

      expect(material.aoMapIntensity).toBe(0.5)
    })
  })
})
