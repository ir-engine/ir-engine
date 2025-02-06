import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Color, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity, SerializedComponentType, setComponent, UUIDComponent } from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  createMaterialPrototype,
  getPrototypeEntityFromName
} from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import MeshStandardMaterialPrototype from '@ir-engine/spatial/src/renderer/materials/prototypes/MeshStandardMaterial.mat'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { SourceComponent } from '../scene/components/SourceComponent'
import { createSceneEntity } from '../scene/functions/createSceneEntity'
import { exportGLTFScene } from './exportGLTFScene'
import { EEMaterialComponent } from './MaterialDefinitionComponent'

describe('exportGLTFScene', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('export an empty gltf file', async () => {
    const baseEntity = createSceneEntity('base')
    setComponent(baseEntity, SourceComponent, 'test-source')

    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test/path', false)) as [GLTF.IGLTF]
    assert(Array.isArray(gltf.nodes))
    assert(gltf.nodes!.length === 0)
  })

  it('export singleton gltf file', async () => {
    const baseEntity = createSceneEntity('base')
    setComponent(baseEntity, SourceComponent, 'test-source')

    const childEntity = createSceneEntity('child', baseEntity)
    const position = new Vector3(Math.random(), Math.random(), Math.random())
    setComponent(childEntity, TransformComponent, { position })
    computeTransformMatrix(childEntity)
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
    const baseEntity = createSceneEntity('mesh')
    setComponent(baseEntity, SourceComponent, 'test')
    const color = new Color(Math.random(), Math.random(), Math.random())
    const originalMaterial = new MeshStandardMaterial({ color, name: 'test material' })
    const materialEntity = createEntity()
    createMaterialPrototype(MeshStandardMaterialPrototype)
    setComponent(materialEntity, UUIDComponent, originalMaterial.uuid)
    setComponent(materialEntity, MaterialStateComponent, {
      prototypeEntity: getPrototypeEntityFromName('MeshStandardMaterial'),
      material: originalMaterial
    })
    setComponent(materialEntity, NameComponent, originalMaterial.name)
    setComponent(baseEntity, MeshComponent, new Mesh(new SphereGeometry(), originalMaterial))
    const [gltf] = (await exportGLTFScene(baseEntity, 'dud', 'test')) as [GLTF.IGLTF]
    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes.length, 1)
    assert(Array.isArray(gltf.meshes))
    assert.strictEqual(gltf.meshes.length, 1)
    const node = gltf.nodes[0]
    assert.strictEqual(node.mesh, 0)
    const mesh = gltf.meshes[0]
    assert.strictEqual(mesh.primitives.length, 1)
    const primitive = mesh.primitives[0]
    assert.strictEqual(primitive.material, 0)
    assert(Array.isArray(gltf.materials))
    assert.strictEqual(gltf.materials.length, 1)
    const material = gltf.materials[0]
    assert.strictEqual(typeof material.extensions![EEMaterialComponent.jsonID], 'object')
    const eeMaterial = material.extensions![EEMaterialComponent.jsonID] as SerializedComponentType<
      typeof EEMaterialComponent
    >
    assert.equal(eeMaterial.name, originalMaterial.name)
    const serializedColor = eeMaterial.args['color'].contents as Color
    for (const key of Object.keys(serializedColor)) {
      assert.strictEqual(serializedColor[key], color[key])
    }
    assert.strictEqual(eeMaterial.prototype, 'MeshStandardMaterial')
  })

  it('export multi-material mesh', async () => {
    const meshEntity = createSceneEntity('mesh')
    setComponent(meshEntity, SourceComponent, 'test')

    // Create a geometry and define two groups (one for each material).
    // Clearing the default groups lets us control exactly which indices
    // get assigned to each material.
    const geometry = new SphereGeometry(1, 8, 8)
    geometry.clearGroups()
    const indexCount = geometry.index ? geometry.index.count : 0
    const half = Math.floor(indexCount / 2)
    geometry.addGroup(0, half, 0) // First half: use material at index 0.
    geometry.addGroup(half, indexCount - half, 1) // Second half: use material at index 1.

    // Initialize the material prototype (only once)
    createMaterialPrototype(MeshStandardMaterialPrototype)

    // Create the first material instance with its own material entity.
    const color1 = new Color(Math.random(), Math.random(), Math.random())
    const material1 = new MeshStandardMaterial({ color: color1, name: 'material1' })
    const materialEntity1 = createEntity()
    setComponent(materialEntity1, UUIDComponent, material1.uuid)
    setComponent(materialEntity1, MaterialStateComponent, {
      prototypeEntity: getPrototypeEntityFromName('MeshStandardMaterial'),
      material: material1
    })
    setComponent(materialEntity1, NameComponent, material1.name)

    // Create the second material instance with its own material entity.
    const color2 = new Color(Math.random(), Math.random(), Math.random())
    const material2 = new MeshStandardMaterial({ color: color2, name: 'material2' })
    const materialEntity2 = createEntity()
    setComponent(materialEntity2, UUIDComponent, material2.uuid)
    setComponent(materialEntity2, MaterialStateComponent, {
      prototypeEntity: getPrototypeEntityFromName('MeshStandardMaterial'),
      material: material2
    })
    setComponent(materialEntity2, NameComponent, material2.name)

    // Create a mesh with the multi-materials by passing an array.
    const mesh = new Mesh(geometry, [material1, material2])
    setComponent(meshEntity, MeshComponent, mesh)

    // Export the scene as a GLTF document.
    const [gltf] = (await exportGLTFScene(meshEntity, 'dud', 'test')) as [GLTF.IGLTF]

    // Validate that a single node exists that references mesh index 0.
    assert(Array.isArray(gltf.nodes))
    assert.strictEqual(gltf.nodes.length, 1)
    const node = gltf.nodes[0]
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

    // Verify the first material’s extension data.
    const exportedMaterial1 = gltf.materials[0]
    assert.strictEqual(typeof exportedMaterial1.extensions![EEMaterialComponent.jsonID], 'object')
    const eeMaterial1 = exportedMaterial1.extensions![EEMaterialComponent.jsonID] as SerializedComponentType<
      typeof EEMaterialComponent
    >
    assert.equal(eeMaterial1.name, material1.name)
    const serializedColor1 = eeMaterial1.args['color'].contents as Color
    for (const key of Object.keys(serializedColor1)) {
      assert.strictEqual(serializedColor1[key], color1[key])
    }
    assert.strictEqual(eeMaterial1.prototype, 'MeshStandardMaterial')

    // Verify the second material’s extension data.
    const exportedMaterial2 = gltf.materials[1]
    assert.strictEqual(typeof exportedMaterial2.extensions![EEMaterialComponent.jsonID], 'object')
    const eeMaterial2 = exportedMaterial2.extensions![EEMaterialComponent.jsonID] as SerializedComponentType<
      typeof EEMaterialComponent
    >
    assert.equal(eeMaterial2.name, material2.name)
    const serializedColor2 = eeMaterial2.args['color'].contents as Color
    for (const key of Object.keys(serializedColor2)) {
      assert.strictEqual(serializedColor2[key], color2[key])
    }
    assert.strictEqual(eeMaterial2.prototype, 'MeshStandardMaterial')
  })
})
