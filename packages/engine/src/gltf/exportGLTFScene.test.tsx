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

import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import {
  AnimationClip,
  Bone,
  BoxGeometry,
  BufferAttribute,
  Color,
  InterpolateDiscrete,
  InterpolateLinear,
  InterpolateSmooth,
  KeyframeTrack,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NormalAnimationBlendMode,
  Skeleton,
  SkinnedMesh,
  SphereGeometry,
  Texture,
  Vector2,
  Vector3
} from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  createEntity,
  defineComponent,
  EntityID,
  EntityTreeComponent,
  S,
  SerializedComponentType,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { createSceneEntity } from '../scene/functions/createSceneEntity'
import { exportGLTFScene, materialExtensions } from './exportGLTFScene'
import { GLTFComponent } from './GLTFComponent'

describe('exportGLTFScene', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('export an empty gltf file', async () => {
    const baseEntity = createSceneEntity('base')

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path', false)) as [GLTF.IGLTF]
    assert(Array.isArray(gltf.nodes))
    assert(gltf.nodes!.length === 0)
  })

  it('can export a gltf file with a single entity and export root set to false', async () => {
    const baseEntity = createSceneEntity('base')

    createSceneEntity('child', baseEntity)

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path', false)) as [GLTF.IGLTF]
    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes!.length, 1)
    assert.strictEqual(gltf.nodes![0].name, 'child')
  })

  it('export singleton gltf file', async () => {
    const baseEntity = createSceneEntity('base')

    const childEntity = createSceneEntity('child', baseEntity)

    const position = new Vector3(Math.random(), Math.random(), Math.random())
    setComponent(childEntity, TransformComponent, { position })
    TransformComponent.computeTransformMatrix(childEntity)

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path')) as [GLTF.IGLTF]

    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes!.length, 2)
    const serializedBase = gltf.nodes.findIndex((node) => node.name === 'base')
    assert.notStrictEqual(serializedBase, -1)
    const serializedChild = gltf.nodes.findIndex((node) => node.name === 'child')
    assert.notStrictEqual(serializedChild, -1)
    assert.strictEqual(gltf.nodes![serializedBase].children?.[0], serializedChild)
    assert.strictEqual(gltf.nodes![serializedChild].matrix![12], position.x)
    assert.strictEqual(gltf.nodes![serializedChild].matrix![13], position.y)
    assert.strictEqual(gltf.nodes![serializedChild].matrix![14], position.z)
  })

  it('export simple mesh', async () => {
    const baseEntity = createSceneEntity('root')

    const sourceID = GLTFComponent.getSourceID(baseEntity)

    const color = new Color(Math.random(), Math.random(), Math.random())
    const originalMaterial = new MeshStandardMaterial({ color, name: 'test material' })

    const materialEntity = createEntity()
    setComponent(materialEntity, UUIDComponent, {
      entitySourceID: sourceID,
      entityID: 'test-material' as EntityID
    })
    setComponent(materialEntity, NameComponent, originalMaterial.name)
    setComponent(materialEntity, MaterialStateComponent, {
      material: originalMaterial
    })
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: baseEntity })

    const meshEntity = createEntity()
    setComponent(meshEntity, UUIDComponent, {
      entitySourceID: sourceID,
      entityID: 'mesh' as EntityID
    })
    setComponent(meshEntity, MaterialInstanceComponent, {
      entities: [materialEntity]
    })
    setComponent(meshEntity, NameComponent, 'mesh')
    setComponent(meshEntity, EntityTreeComponent, { parentEntity: baseEntity })
    setComponent(meshEntity, MeshComponent, new Mesh(new SphereGeometry(), originalMaterial))

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test')) as [GLTF.IGLTF]

    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes.length, 2)
    assert(Array.isArray(gltf.meshes))
    assert.strictEqual(gltf.meshes.length, 1)
    const node = gltf.nodes[1]
    assert.strictEqual(node.mesh, 0)
    const mesh = gltf.meshes[0]
    assert.strictEqual(mesh.primitives.length, 1)
    const primitive = mesh.primitives[0]
    assert.strictEqual(primitive.material, 0)
    assert(Array.isArray(gltf.materials))
    assert.strictEqual(gltf.materials.length, 1)
    const material = gltf.materials[0]
    assert(material.pbrMetallicRoughness)
    assert(Array.isArray(material.pbrMetallicRoughness.baseColorFactor))
    for (let i = 0; i < 3; i++) {
      const channel = material.pbrMetallicRoughness.baseColorFactor[i]
      assert.strictEqual(channel, color.toArray()[i])
    }
    assert.strictEqual(material.name, originalMaterial.name)
  })

  it('export multi-material mesh', async () => {
    const baseEntity = createSceneEntity('base')
    const sourceID = GLTFComponent.getSourceID(baseEntity)

    // Create a geometry and define two groups (one for each material).
    // Clearing the default groups lets us control exactly which indices
    // get assigned to each material.
    const geometry = new SphereGeometry(1, 8, 8)
    geometry.clearGroups()
    const indexCount = geometry.index ? geometry.index.count : 0
    const half = Math.floor(indexCount / 2)
    geometry.addGroup(0, half, 0) // First half: use material at index 0.
    geometry.addGroup(half, indexCount - half, 1) // Second half: use material at index 1.

    // Create the first material instance with its own material entity.
    const color1 = new Color(Math.random(), Math.random(), Math.random())
    const material1 = new MeshStandardMaterial({ color: color1, name: 'material1' })
    const materialEntity1 = createEntity()
    setComponent(materialEntity1, UUIDComponent, {
      entitySourceID: sourceID,
      entityID: 'material1' as EntityID
    })
    setComponent(materialEntity1, NameComponent, material1.name)
    setComponent(materialEntity1, MaterialStateComponent, {
      material: material1
    })
    setComponent(materialEntity1, EntityTreeComponent, { parentEntity: baseEntity })

    // Create the second material instance with its own material entity.
    const color2 = new Color(Math.random(), Math.random(), Math.random())
    const material2 = new MeshStandardMaterial({ color: color2, name: 'material2' })
    const materialEntity2 = createEntity()
    setComponent(materialEntity2, UUIDComponent, {
      entitySourceID: sourceID,
      entityID: 'material2' as EntityID
    })
    setComponent(materialEntity2, NameComponent, material2.name)
    setComponent(materialEntity2, MaterialStateComponent, {
      material: material2
    })
    setComponent(materialEntity2, EntityTreeComponent, { parentEntity: baseEntity })

    const meshEntity = createEntity()
    setComponent(meshEntity, UUIDComponent, {
      entitySourceID: sourceID,
      entityID: 'mesh' as EntityID
    })
    setComponent(meshEntity, NameComponent, 'mesh')
    setComponent(meshEntity, EntityTreeComponent, { parentEntity: baseEntity })
    setComponent(meshEntity, MeshComponent, new Mesh(geometry, [material1, material2]))
    // Create a mesh with the multi-materials by passing an array.
    setComponent(meshEntity, MaterialInstanceComponent, {
      entities: [materialEntity1, materialEntity2]
    })

    // Export the scene as a GLTF document.
    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test')) as [GLTF.IGLTF]

    // Validate that a single node exists that references mesh index 0.
    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes.length, 2)
    const node = gltf.nodes[1]
    assert.strictEqual(node.mesh, 0)

    // Validate that one mesh was exported.
    assert(Array.isArray(gltf.meshes))
    assert.strictEqual(gltf.meshes.length, 1)
    const exportedMesh = gltf.meshes[0]
    // Expect two primitives from the two geometry groups.
    assert(Array.isArray(exportedMesh.primitives))
    assert.strictEqual(exportedMesh.primitives.length, 2)

    // Check that each primitive correctly references its material.
    // (Assuming the order of groups is maintained.)
    const primitive1 = exportedMesh.primitives[0]
    const primitive2 = exportedMesh.primitives[1]
    assert.strictEqual(primitive1.material, 0)
    assert.strictEqual(primitive2.material, 1)

    // Validate that two materials were exported.
    assert(Array.isArray(gltf.materials))
    assert.strictEqual(gltf.materials.length, 2)

    // Assert that the exported materials have the correct colors.
    const exportedMaterial1 = gltf.materials[0]
    const exportedMaterial2 = gltf.materials[1]
    for (let i = 0; i < 3; i++) {
      const channel1 = exportedMaterial1.pbrMetallicRoughness!.baseColorFactor![i]
      const channel2 = exportedMaterial2.pbrMetallicRoughness!.baseColorFactor![i]
      assert.strictEqual(channel1, color1.toArray()[i])
      assert.strictEqual(channel2, color2.toArray()[i])
    }

    // Assert that the exported materials have the correct names.
    assert.strictEqual(exportedMaterial1.name, material1.name)
    assert.strictEqual(exportedMaterial2.name, material2.name)
  })

  const createDudMesh = () => {
    const baseEntity = createSceneEntity('base')
    const meshEntity = createSceneEntity('mesh', baseEntity)

    // Create a sphere geometry.
    const geometry = new SphereGeometry(1, 8, 8)

    // Create a texture and assign its userData.src field.
    const textureUrl = 'https://example.com/projects/ir-engine/dud-project/public/images/image.png'
    const texture = new Texture()
    texture.userData = { src: textureUrl }
    texture.image = {}

    // Create a MeshStandardMaterial with a texture map.
    const color = new Color(Math.random(), Math.random(), Math.random())
    const material = new MeshStandardMaterial({
      color,
      name: 'material-with-map',
      map: texture
    })

    // Create a material entity for the material.
    const materialEntity = createEntity()
    setComponent(materialEntity, UUIDComponent, {
      entitySourceID: GLTFComponent.getSourceID(baseEntity),
      entityID: 'material' as EntityID
    })
    setComponent(materialEntity, NameComponent, material.name)
    setComponent(materialEntity, MaterialStateComponent, {
      material
    })
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: baseEntity })

    // Create a mesh using the geometry and material.
    const mesh = new Mesh(geometry, material)
    setComponent(meshEntity, MaterialInstanceComponent, {
      entities: [materialEntity]
    })
    setComponent(meshEntity, MeshComponent, mesh)
    return { baseEntity, meshEntity, materialEntity }
  }

  it('export mesh with material texture map', async () => {
    const { baseEntity } = createDudMesh()
    // Export the scene. The first element is the GLTF JSON.
    const [gltf, ...files] = (await exportGLTFScene(
      baseEntity,
      'ir-engine/dud-project',
      'assets/base/folder1/test.gltf'
    )) as [GLTF.IGLTF]

    // Validate that the GLTF contains a single node referencing mesh index 0.
    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes.length, 2)
    const node = gltf.nodes[1]
    assert.strictEqual(node.mesh, 0)

    // Validate that one mesh was exported with one primitive.
    assert(Array.isArray(gltf.meshes))
    assert.strictEqual(gltf.meshes.length, 1)
    const exportedMesh = gltf.meshes[0]
    assert(Array.isArray(exportedMesh.primitives))
    assert.strictEqual(exportedMesh.primitives.length, 1)
    const primitive = exportedMesh.primitives[0]
    assert.strictEqual(primitive.material, 0)

    // Validate that one material was exported.
    assert(Array.isArray(gltf.materials))
    assert.strictEqual(gltf.materials.length, 1)
    const exportedMaterial = gltf.materials[0]

    // Assert that the exported material has the correct name.
    assert.strictEqual(exportedMaterial.name, 'material-with-map')

    // Assert that the exported material has the correct texture map.
    assert(exportedMaterial.pbrMetallicRoughness)
    assert(exportedMaterial.pbrMetallicRoughness.baseColorTexture)
    assert.strictEqual(exportedMaterial.pbrMetallicRoughness.baseColorTexture.index, 0)

    // Assert that the exported texture has the correct URI.
    assert(Array.isArray(gltf.images))
    assert.strictEqual(gltf.images.length, 1)
    const exportedTexture = gltf.images[0]
    assert.strictEqual(exportedTexture.uri, '../../../public/images/image.png')
  })

  it('export mesh with material texture map into new folder', async () => {
    const { baseEntity } = createDudMesh()
    const [gltf, ...files] = (await exportGLTFScene(baseEntity, 'ir-engine/dud-project', 'base/folder2/test.gltf')) as [
      GLTF.IGLTF
    ]
    assert.strictEqual(gltf.images?.[0]?.uri, '../../public/images/image.png')
  })

  it('export custom ECS data', async () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      jsonID: 'IR_test-component',
      schema: S.Object({
        string: S.String({ default: 'value' }),
        number: S.Number({ default: 1 })
      })
    })
    const entity = createSceneEntity('test')
    const num = Math.random()
    setComponent(entity, TestComponent, {
      string: 'value',
      number: num
    })

    const [gltf] = (await exportGLTFScene(entity, 'dud-project', 'base/test.gltf')) as [GLTF.IGLTF]
    const ecsExtension = gltf.nodes?.[0]?.extensions?.['IR_test-component'] as SerializedComponentType<
      typeof TestComponent
    >
    assert.strictEqual(typeof ecsExtension, 'object')
    assert.strictEqual(ecsExtension.number, num)
    assert.strictEqual(ecsExtension.string, 'value')
  })

  it('should export materials without meshes', async () => {
    const baseEntity = createSceneEntity('base')
    const sourceID = GLTFComponent.getSourceID(baseEntity)

    const materialEntity = createEntity()
    const color = new Color(Math.random(), Math.random(), Math.random())
    const originalMaterial = new MeshStandardMaterial({ color, name: 'test material' })
    setComponent(materialEntity, UUIDComponent, {
      entitySourceID: sourceID,
      entityID: 'test-material' as EntityID
    })
    setComponent(materialEntity, NameComponent, originalMaterial.name)
    setComponent(materialEntity, MaterialStateComponent, {
      material: originalMaterial
    })
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: baseEntity })

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path')) as [GLTF.IGLTF]

    assert(Array.isArray(gltf.materials))
    assert.strictEqual(gltf.materials.length, 1)
    const material = gltf.materials[0]
    assert.strictEqual(material.name, originalMaterial.name)

    assert(material.pbrMetallicRoughness)
    assert(Array.isArray(material.pbrMetallicRoughness.baseColorFactor))
    for (let i = 0; i < 3; i++) {
      const channel = material.pbrMetallicRoughness.baseColorFactor[i]
      assert.strictEqual(channel, color.toArray()[i])
    }
  })

  it('should export animations', async () => {
    const baseEntity = createSceneEntity('base')
    setComponent(baseEntity, UUIDComponent, {
      entitySourceID: GLTFComponent.getSourceID(baseEntity),
      entityID: 'test track' as EntityID
    })

    const tracks = [
      new KeyframeTrack(
        'test track',
        new Float32Array([1, 2, 3, 4, 5]),
        new Float32Array([1, 2, 3, 4, 5]),
        InterpolateDiscrete
      ),
      new KeyframeTrack(
        'test track',
        new Float32Array([6, 7, 8, 9, 10]),
        new Float32Array([6, 7, 8, 9, 10]),
        InterpolateLinear
      ),
      new KeyframeTrack(
        'test track',
        new Float32Array([4, 3, 2, 1, 0]),
        new Float32Array([0, 1, 2, 3, 4]),
        InterpolateSmooth
      )
    ]

    const clip = new AnimationClip('test clip', 1000, tracks, NormalAnimationBlendMode)

    setComponent(baseEntity, AnimationComponent, {
      animations: [clip]
    })

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path')) as [GLTF.IGLTF]

    // 1 for track values, 1 for track times
    assert.equal(gltf.bufferViews?.length, tracks.length * 2)
    assert.equal(gltf.accessors?.length, tracks.length * 2)

    const animations = gltf.animations
    assert.equal(animations?.length, 1)

    const anim = animations![0]
    assert.equal(anim.name, clip.name)
    assert.equal(anim.channels.length, tracks.length)
    assert.equal(anim.samplers.length, tracks.length)

    const expInterpolation = ['STEP', 'LINEAR', 'LINEAR']
    const inputOutputAccessors = new Set<number>()

    for (let i = 0; i < tracks.length; i++) {
      const channel = anim.channels[i]
      const sampler = anim.samplers[i]

      assert.equal(channel.sampler, i)
      assert.equal(sampler.interpolation, expInterpolation[i])
      // There's no required order that these will be created in so just check that they are valid and unqiue
      assert(typeof sampler.input === 'number')
      assert(typeof sampler.output === 'number')
      assert(!inputOutputAccessors.has(sampler.input))
      assert(!inputOutputAccessors.has(sampler.output))
      inputOutputAccessors.add(sampler.input)
      inputOutputAccessors.add(sampler.output)
    }
  })

  it('should export skins', async () => {
    const baseEntity = createSceneEntity('base')

    const skinnedMesh = new SkinnedMesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
    const bones = [new Bone()] as Bone[]
    bones[0].entity = baseEntity
    const boneInverses = [new Matrix4(), new Matrix4(), new Matrix4()]
    const skeleton = new Skeleton(bones, boneInverses)
    skinnedMesh.skeleton = skeleton

    const skinnedMeshEntity = createEntity()
    setComponent(skinnedMeshEntity, UUIDComponent, {
      entitySourceID: GLTFComponent.getSourceID(baseEntity),
      entityID: 'skinned-mesh' as EntityID
    })
    setComponent(skinnedMeshEntity, MeshComponent, skinnedMesh)
    setComponent(skinnedMeshEntity, SkinnedMeshComponent, skinnedMesh)
    setComponent(skinnedMeshEntity, EntityTreeComponent, { parentEntity: baseEntity })

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path')) as [GLTF.IGLTF]

    const nodes = gltf.nodes
    const meshes = gltf.meshes
    const skins = gltf.skins

    assert.equal(nodes?.length, 2)
    assert.equal(meshes?.length, 1)
    assert.equal(skins?.length, 1)
    const skin = skins![0]

    const skinNode = nodes![1]

    assert(typeof skinNode.mesh === 'number')
    assert(typeof skinNode.skin === 'number')

    assert(typeof skin.inverseBindMatrices === 'number')
    assert.equal(skin.joints.length, 1)
    // The joint is referencing the root node
    assert.equal(skin.joints[0], 0)
  })

  it('should export morph targets', async () => {
    const baseEntity = createSceneEntity('base')
    setComponent(baseEntity, UUIDComponent, { entityID: 'id' as EntityID, entitySourceID: 'base' as SourceID })

    const morphName = 'POSITION'
    const morphMesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
    morphMesh.morphTargetInfluences = [0, 1]
    morphMesh.geometry.morphAttributes[morphName] = [
      new BufferAttribute(new Float32Array([1, 2, 3, 4, 5]), 1),
      new BufferAttribute(new Float32Array([5, 6, 7, 8, 9]), 1)
    ]

    const morphMeshEntity = createEntity()
    setComponent(morphMeshEntity, UUIDComponent, {
      entitySourceID: GLTFComponent.getSourceID(baseEntity),
      entityID: 'morph-mesh' as EntityID
    })
    setComponent(morphMeshEntity, MeshComponent, morphMesh)
    setComponent(morphMeshEntity, EntityTreeComponent, { parentEntity: baseEntity })

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path')) as [GLTF.IGLTF]

    const meshes = gltf.meshes
    assert.equal(meshes?.length, 1)

    const mesh = meshes![0]

    for (let i = 0; i < morphMesh.morphTargetInfluences.length; i++) {
      const influence = morphMesh.morphTargetInfluences[i]
      const weight = mesh.weights![i]
      assert.equal(influence, weight)
    }

    for (const primitive of mesh.primitives) {
      assert.equal(primitive.targets!.length, morphMesh.morphTargetInfluences.length)
      for (const target of primitive.targets!) {
        assert(typeof target[morphName] === 'number')
      }
    }
  })

  it('should export material extensions', async () => {
    const baseEntity = createSceneEntity('base')

    const textureUrl = 'https://example.com/projects/ir-engine/dud-project/public/images/image.png'
    const texture = new Texture()
    texture.userData = { src: textureUrl }
    texture.image = {}

    const material = new MeshPhysicalMaterial({
      // KHR_materials_emissive_strength
      emissiveIntensity: 1,
      // KHR_materials_clearcoat
      clearcoat: 1,
      clearcoatMap: texture,
      clearcoatRoughness: 1,
      clearcoatRoughnessMap: texture,
      clearcoatNormalMap: texture,
      clearcoatNormalScale: new Vector2(1, 1),
      // KHR_materials_iridescence
      iridescence: 1,
      iridescenceMap: texture,
      iridescenceIOR: 1,
      iridescenceThicknessMap: texture,
      iridescenceThicknessRange: [100, 200],
      // KHR_materials_sheen
      sheenColor: new Color(0x111111),
      sheenColorMap: texture,
      sheenRoughness: 1,
      sheenRoughnessMap: texture,
      // KHR_materials_transmission
      transmission: 1,
      transmissionMap: texture,
      // KHR_materials_volume
      thickness: 1,
      thicknessMap: texture,
      attenuationDistance: 1,
      attenuationColor: new Color(0x111111),
      // KHR_materials_ior
      ior: 1,
      // KHR_materials_specular
      specularIntensity: 1,
      specularIntensityMap: texture,
      specularColor: new Color(0x111111),
      specularColorMap: texture,
      // EXT_materials_bump
      bumpScale: 1,
      bumpMap: texture,
      // KHR_materials_anisotropy
      anisotropy: 1,
      anisotropyRotation: 1,
      anisotropyMap: texture
    })

    const materialEntity = createEntity()
    setComponent(materialEntity, UUIDComponent, {
      entitySourceID: GLTFComponent.getSourceID(baseEntity),
      entityID: 'material' as EntityID
    })
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: baseEntity })
    setComponent(materialEntity, UUIDComponent, {
      entitySourceID: GLTFComponent.getSourceID(baseEntity),
      entityID: 'test-material' as EntityID
    })
    setComponent(materialEntity, MaterialStateComponent, {
      material: material
    })

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path')) as [GLTF.IGLTF]

    const materials = gltf.materials
    assert.equal(materials?.length, 1)

    const mat = materials![0]

    for (const ext of materialExtensions) {
      assert(mat.extensions![ext.jsonID])
    }
  })
})
