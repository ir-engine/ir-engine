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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import {
  createEngine,
  createEntity,
  destroyEngine,
  EngineState,
  Entity,
  EntityID,
  EntityTreeComponent,
  getChildrenWithComponents,
  getComponent,
  LayerFunctions,
  Layers,
  setComponent,
  SourceID,
  SystemDefinitions,
  UUIDComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { MeshBVHSystem, ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { Cache, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserID } from '@ir-engine/common/src/schema.type.module'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { startEngineReactor } from '@ir-engine/engine/tests/startEngineReactor'
import { applyIncomingActions, getMutableState, getState, startReactor } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EditorState } from '../services/EditorServices'
import { addMediaNode } from './addMediaNode'

vi.mock('./utils', () => ({
  getContentType: vi.fn().mockImplementation((url) => {
    if (url.includes('material.gltf')) return 'model/material'
    if (url.includes('lookdev.gltf')) return 'model/lookdev'
    if (url.includes('prefab.gltf')) return 'model/prefab'
    if (url.includes('.gltf') || url.includes('.glb')) return 'model/gltf'
    if (url.includes('.mp4') || url.includes('.webm')) return 'video/mp4'
    if (url.includes('.jpg') || url.includes('.png')) return 'image/png'
    if (url.includes('.mp3') || url.includes('.wav')) return 'audio/mp3'
    return 'application/octet-stream'
  }),
  getIncreamentedName: vi.fn().mockImplementation((name) => name)
}))

const createModelGLTF = () => ({
  scene: 0,
  scenes: [
    {
      nodes: [0]
    }
  ],
  nodes: [
    {
      name: 'Triangle',
      mesh: 0,
      extensions: {
        [UUIDComponent.jsonID]: 'mesh-id',
        [VisibleComponent.jsonID]: true
      }
    }
  ],
  meshes: [
    {
      primitives: [
        {
          attributes: {
            POSITION: 1
          },
          indices: 0,
          material: 0
        }
      ]
    }
  ],
  materials: [
    {
      name: 'Standard Material',
      pbrMetallicRoughness: {
        baseColorFactor: [0.8, 0.8, 0.8, 1.0],
        metallicFactor: 0.5,
        roughnessFactor: 0.5
      }
    }
  ],
  buffers: [
    {
      uri: 'data:application/octet-stream;base64,AAABAAIAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAAAAAACAPwAAAAA=',
      byteLength: 44
    }
  ],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: 6,
      target: 34963
    },
    {
      buffer: 0,
      byteOffset: 8,
      byteLength: 36,
      target: 34962
    }
  ],
  accessors: [
    {
      bufferView: 0,
      byteOffset: 0,
      componentType: 5123,
      count: 3,
      type: 'SCALAR',
      max: [2],
      min: [0]
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5126,
      count: 3,
      type: 'VEC3',
      max: [1.0, 1.0, 0.0],
      min: [0.0, 0.0, 0.0]
    }
  ],
  asset: {
    version: '2.0'
  },
  extensionsUsed: [UUIDComponent.jsonID, VisibleComponent.jsonID]
})

const createMaterialGLTF = () => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine Test'
  },
  scenes: [],
  nodes: [],
  materials: [
    {
      name: 'Test Material',
      pbrMetallicRoughness: {
        baseColorFactor: [1.0, 0.0, 0.0, 1.0],
        metallicFactor: 0.0,
        roughnessFactor: 1.0
      }
    }
  ],
  extensionsUsed: []
})

const waitForScene = (entity: Entity) => vi.waitUntil(() => GLTFComponent.isSceneLoaded(entity), { timeout: 5000 })

describe('addMediaNode', () => {
  let physicsWorldEntity: Entity
  let rootEntity: Entity

  beforeEach(async () => {
    Cache.enabled = true

    createEngine()
    mockSpatialEngine()

    getMutableState(EngineState).isEditing.set(true)
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).userID.set('test-user' as UserID)

    await Physics.load()
    physicsWorldEntity = createEntity()
    setComponent(physicsWorldEntity, UUIDComponent, {
      entitySourceID: 'source' as SourceID,
      entityID: 'physics-world-uuid' as EntityID
    })
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)

    startEngineReactor()

    // get state to invoke reactor
    getState(AuthoringState)
  })

  afterEach(() => {
    Cache.clear()
    destroyEngine()
  })

  it('should load a regular GLTF model', async () => {
    const createSceneGLTF = () => ({
      asset: {
        version: '2.0',
        generator: 'iR Engine Test'
      },
      scenes: [{ nodes: [] }],
      scene: 0,
      nodes: [],
      extensionsUsed: [UUIDComponent.jsonID, VisibleComponent.jsonID]
    })

    const sceneURL = 'https://test.com/test-scene.gltf'
    const sceneGLTF = createSceneGLTF()
    Cache.add(sceneURL, sceneGLTF)

    rootEntity = AssetState.load(sceneURL, undefined, physicsWorldEntity, Layers.Authoring)
    getMutableState(EditorState).rootEntity.set(rootEntity)

    await waitForScene(rootEntity)
    await flushAll()
    applyIncomingActions()
    await vi.waitUntil(() => getState(AssetState)[GLTFComponent.getSourceID(rootEntity)])

    const modelURL = 'https://test.com/test-model.gltf'
    const modelGLTF = createModelGLTF()
    Cache.add(modelURL, modelGLTF)

    const entityUUID = await addMediaNode(modelURL)

    const newModelEntity = UUIDComponent.getEntityByUUID(entityUUID!, Layers.Authoring)
    expect(newModelEntity).toBeDefined()

    await flushAll()
    applyIncomingActions()

    await waitForScene(newModelEntity)

    expect(getComponent(newModelEntity, EntityTreeComponent).parentEntity).toBe(rootEntity)

    expect(getComponent(newModelEntity, GLTFComponent)).toBeDefined()

    const [meshEntity] = getChildrenWithComponents(newModelEntity, [MeshComponent])
    const [materialEntity] = getChildrenWithComponents(newModelEntity, [MaterialStateComponent])
    expect(getComponent(meshEntity, MeshComponent)).toBeDefined()
    expect(getComponent(materialEntity, MaterialStateComponent)).toBeDefined()
  })

  /** @todo https://github.com/ir-engine/ir-engine/pull/1912 */
  it.todo('should load a material and replace material at intersection', { timeout: 60000 }, async () => {
    const createSceneGLTF = () => ({
      asset: {
        version: '2.0',
        generator: 'iR Engine Test'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'Model',
          extensions: {
            [UUIDComponent.jsonID]: 'model-node-id',
            [GLTFComponent.jsonID]: {
              src: 'https://test.com/test-model.gltf'
            },
            [VisibleComponent.jsonID]: true
          }
        }
      ],
      extensionsUsed: [UUIDComponent.jsonID, VisibleComponent.jsonID]
    })

    const sceneURL = 'https://test.com/test-scene.gltf'
    const sceneGLTF = createSceneGLTF()
    Cache.add(sceneURL, sceneGLTF)

    const modelURL = 'https://test.com/test-model.gltf'
    const modelGLTF = createModelGLTF()
    Cache.add(modelURL, modelGLTF)

    rootEntity = AssetState.load(sceneURL, undefined, physicsWorldEntity, Layers.Authoring)
    getMutableState(EditorState).rootEntity.set(rootEntity)
    await waitForScene(rootEntity)
    await flushAll()
    applyIncomingActions()

    const meshBVHReactor = SystemDefinitions.get(MeshBVHSystem)!.reactor!
    startReactor(meshBVHReactor)

    const modelEntitySimulation = GLTFComponent.getEntityBySourceAndID(rootEntity, 'model-node-id' as EntityID)
    const modelEntity = LayerFunctions.getAuthoringCounterpart(modelEntitySimulation)
    const [meshEntity] = getChildrenWithComponents(modelEntity, [MeshComponent])

    await vi.waitUntil(() => getComponent(meshEntity, MeshComponent).geometry.boundsTree, { timeout: 10000 })

    const materialURL = 'https://test.com/test-material.material.gltf'
    const materialGLTF = createMaterialGLTF()
    Cache.add(materialURL, materialGLTF)

    const pointerEntity = createEntity()
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    setComponent(pointerEntity, InputPointerComponent, { cameraEntity: viewerEntity })

    // pose viewer entity
    setComponent(viewerEntity, TransformComponent, { position: new Vector3(0.5, 0.5, 1), rotation: new Quaternion() })

    const meshUUID = UUIDComponent.get(meshEntity)
    const [materialEntity] = getChildrenWithComponents(modelEntity, [MaterialStateComponent])

    const entityUUID = await addMediaNode(materialURL, rootEntity) // entityUUID will be the mesh entity receiving the material
    expect(entityUUID).toBe(meshUUID)

    await vi.waitFor(() => {
      expect(getComponent(meshEntity, MaterialInstanceComponent).entities[0]).not.toBe(
        getComponent(materialEntity, UUIDComponent).entityID
      )
    })

    const newMaterialEntity = UUIDComponent.getEntityFromSameSourceByID(
      meshEntity,
      getComponent(meshEntity, MaterialInstanceComponent).entities[0]
    )
    const material = getComponent(newMaterialEntity, MaterialStateComponent).material as MeshStandardMaterial

    // assert material properties have updated
    expect(material.color.r).toBe(1)
    expect(material.color.g).toBe(0)
    expect(material.color.b).toBe(0)
    expect(material.metalness).toBe(0)
    expect(material.roughness).toBe(1)
  })

  it.todo('should load a video', async () => {})
  it.todo('should load an image', async () => {})
  it.todo('should load an audio file', async () => {})
})
