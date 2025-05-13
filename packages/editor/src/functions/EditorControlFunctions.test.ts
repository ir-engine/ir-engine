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

import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Cache, Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import { UserID } from '@ir-engine/common/src/schema.type.module'

import {
  createEntity,
  EngineState,
  EntityTreeComponent,
  getComponent,
  hasComponent,
  LayerFunctions,
  Layers,
  removeEntity,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity, EntityID, EntityUUID, SourceID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'

import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { startEngineReactor } from '@ir-engine/engine/tests/startEngineReactor'
import { getMutableState } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { HemisphereLightComponent, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { EditorState } from '../services/EditorServices'
import { EditorControlFunctions } from './EditorControlFunctions'

const waitForScene = (entity: Entity) => vi.waitUntil(() => GLTFComponent.isSceneLoaded(entity), { timeout: 5000 })

describe('EditorControlFunctions', () => {
  let physicsWorldEntity: Entity
  beforeEach(async () => {
    Cache.enabled = true
    createEngine()
    getMutableState(EngineState).isEditing.set(true)
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).userID.set('user' as UserID)
    mockSpatialEngine()
    await Physics.load()
    physicsWorldEntity = createEntity()

    setComponent(physicsWorldEntity, UUIDComponent, {
      entityID: 'physicsWorld' as EntityID,
      entitySourceID: 'source' as SourceID
    })
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)
    const physicsWorld = Physics.createWorld(physicsWorldEntity)
    physicsWorld.timestep = 1 / 60

    startEngineReactor()
  })

  afterEach(() => {
    Cache.enabled = false
    return destroyEngine()
  })

  describe('addOrRemoveComponent', () => {
    it('should add and remove component from root child', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)

      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)
      assert(simulationNodeEntity)

      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)
      assert(authoringNodeEntity)

      EditorControlFunctions.addOrRemoveComponent([authoringNodeEntity], VisibleComponent, true)

      await flushAll()

      assert(hasComponent(authoringNodeEntity, VisibleComponent))

      EditorControlFunctions.addOrRemoveComponent([authoringNodeEntity], VisibleComponent, false)

      await flushAll()

      assert(!hasComponent(authoringNodeEntity, VisibleComponent))
    })

    it('should add and remove component from root child', async () => {
      const nodeID = 'nodeID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [1],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)

      await waitForScene(rootEntity)

      const simulationChildEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, childID)
      assert(simulationChildEntity)

      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.addOrRemoveComponent([authoringChildEntity], VisibleComponent, true)

      await flushAll()

      assert(hasComponent(authoringChildEntity, VisibleComponent))

      EditorControlFunctions.addOrRemoveComponent([authoringChildEntity], VisibleComponent, false)

      await flushAll()

      assert(!hasComponent(authoringChildEntity, VisibleComponent))
    })
  })

  describe('updateMaterialPrototype', () => {
    let materialEntity = UndefinedEntity

    beforeEach(() => {
      materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'material' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(materialEntity)
    })

    it('should return undefined if the `@param materialEntity` does not have a MaterialStateComponent', () => {
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), false)
      // Run and Check the result
      const result = EditorControlFunctions.updateMaterialPrototype(materialEntity, 'MeshStandardMaterial')
      assert.equal(result, undefined)
    })

    it('should return undefined if the prototype does not exist', () => {
      const nonexistantType = 'kodachrome'
      // Set the data as expected
      setComponent(materialEntity, MaterialStateComponent)
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      // Run and Check the result
      const result = EditorControlFunctions.updateMaterialPrototype(materialEntity, nonexistantType)
      assert.equal(result, undefined)
    })

    it('should return undefined if the existing prototype is the same as the new prototype', () => {
      const nonexistantType = 'kodachrome'
      // Set the data as expected
      setComponent(materialEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      // Run and Check the result
      const result = EditorControlFunctions.updateMaterialPrototype(materialEntity, nonexistantType)
      assert.equal(result, undefined)
    })

    it('should update the material prototype given valid conditions', () => {
      const newType = 'MeshStandardMaterial'
      // Set the data as expected
      setComponent(materialEntity, MaterialStateComponent, { material: new MeshPhysicalMaterial() })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      // Run and Check the result
      EditorControlFunctions.updateMaterialPrototype(materialEntity, newType)
      // Check the result
      const materialStateComponent = getComponent(materialEntity, MaterialStateComponent)
      assert.equal(materialStateComponent.material.constructor.name, newType)
    })
  })

  describe('modifyName', () => {
    it('should modify the name of a node', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)
      assert(simulationNodeEntity)

      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      EditorControlFunctions.modifyName([authoringChildEntity], 'newName')

      await flushAll()

      assert.equal(getComponent(authoringChildEntity, NameComponent), 'newName')
    })
  })

  describe('modifyProperty', () => {
    it('should modify the property of a node', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID,
              [HemisphereLightComponent.jsonID!]: {
                skyColor: new Color('green').getHex(),
                groundColor: new Color('purple').getHex(),
                intensity: 0.5
              }
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      EditorControlFunctions.modifyProperty([authoringNodeEntity], HemisphereLightComponent, {
        skyColor: new Color('blue'),
        groundColor: new Color('red'),
        intensity: 0.7
      })

      await flushAll()

      const hemisphereLightComponent = getComponent(authoringNodeEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
    })
    it('should modify a nested property of a node', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID,
              [SplineComponent.jsonID!]: {
                elements: [
                  {
                    position: {
                      x: 0,
                      y: 0,
                      z: 0
                    },
                    rotation: {
                      x: 0,
                      y: 0,
                      z: 0,
                      w: 1
                    }
                  },
                  {
                    position: {
                      x: 5,
                      y: 5,
                      z: 5
                    },
                    rotation: {
                      x: 0,
                      y: 0,
                      z: 0,
                      w: 1
                    }
                  }
                ]
              }
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      EditorControlFunctions.modifyProperty([authoringNodeEntity], SplineComponent, {
        [`elements.${1}.position` as string]: {
          x: 10,
          y: 10,
          z: 10
        }
      })

      await flushAll()

      const splineComponent = getComponent(authoringNodeEntity, SplineComponent)
      assert.equal(splineComponent.elements[1].position.x, 10)
      assert.equal(splineComponent.elements[1].position.y, 10)
      assert.equal(splineComponent.elements[1].position.z, 10)
    })
  })

  describe('createObjectFromSceneElement', () => {
    it('should create a new object from a scene element to root', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement([
        {
          name: HemisphereLightComponent.jsonID,
          props: {
            skyColor: new Color('blue').getHex(),
            groundColor: new Color('red').getHex(),
            intensity: 0.7
          }
        }
      ])

      await flushAll()

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, rootEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })

    it('should create enities in hierarchy using the requested name, adding an increment if a sibling entity with the name already exists', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const requestedName = 'Test'

      const { entityUUID: entity1UUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        authoringNodeEntity,
        UndefinedEntity,
        requestedName
      )

      await flushAll()

      const entity1 = UUIDComponent.getEntityByUUID(entity1UUID, Layers.Authoring)
      assert(entity1)
      assert.equal(getComponent(entity1, NameComponent), 'Test')

      const { entityUUID: entity2UUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        authoringNodeEntity,
        UndefinedEntity,
        requestedName
      )
      const entity2 = UUIDComponent.getEntityByUUID(entity2UUID, Layers.Authoring)
      assert(entity2)
      assert.equal(getComponent(entity2, NameComponent), 'Test 1')

      const { entityUUID: entity3UUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        authoringNodeEntity,
        UndefinedEntity,
        requestedName
      )

      await flushAll()

      const entity3 = UUIDComponent.getEntityByUUID(entity3UUID, Layers.Authoring)
      assert(entity3)
      assert.equal(getComponent(entity3, NameComponent), 'Test 2')
    })

    it('should create a new object from a scene element as child of node', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        authoringNodeEntity
      )

      await flushAll()

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, authoringNodeEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })

    it('should create a new object from a scene element before node', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        rootEntity,
        authoringNodeEntity
      )

      await flushAll()

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, rootEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })

    it('should create a new object from a scene element before child node', async () => {
      const nodeID = 'nodeID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [1],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationChildEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, childID)
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        authoringNodeEntity,
        authoringChildEntity
      )

      await flushAll()

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, authoringNodeEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })
  })

  describe('duplicateObject', () => {
    it('should duplicate an object to root', async () => {
      const nodeID = 'nodeID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID,
              [HemisphereLightComponent.jsonID!]: {
                skyColor: new Color('green').getHex(),
                groundColor: new Color('purple').getHex(),
                intensity: 0.5
              }
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      EditorControlFunctions.duplicateObject([authoringNodeEntity])

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[1]

      assert.equal(getComponent(newEntity, NameComponent), 'node')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, rootEntity)
      assert.equal(getComponent(newEntity, EntityTreeComponent).childIndex, 1)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('green'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('purple'))
      assert.equal(hemisphereLightComponent.intensity, 0.5)
    })
  })

  describe('reparentObject', () => {
    it('should reparent a child node to root', async () => {
      const nodeID = 'nodeID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [1],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationChildEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, childID)!
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.reparentObject([authoringChildEntity], null, null, rootEntity)

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[1]
      assert(newEntity)
      assert.equal(getComponent(newEntity, UUIDComponent).entityID, childID)
    })

    it('should reparent an object to another object', async () => {
      const nodeID = 'nodeID' as EntityID
      const node2ID = 'node2ID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0, 1] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      EditorControlFunctions.reparentObject([authoringNode2Entity], null, null, authoringNodeEntity)

      await flushAll()

      const newEntity = getComponent(authoringNodeEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, authoringNode2Entity)
      assert.equal(getComponent(newEntity, UUIDComponent).entityID, node2ID)
    })

    it('should reparent a child node to root before another node', async () => {
      const nodeID = 'nodeID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [1],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationChildEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, childID)!
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.reparentObject([authoringChildEntity], authoringNodeEntity, null, rootEntity)

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, authoringChildEntity)
      assert.equal(getComponent(newEntity, UUIDComponent).entityID, childID)
    })

    it('should reparent an object to another object before other object', async () => {
      const nodeID = 'nodeID' as EntityID
      const node2ID = 'node2ID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0, 1] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [2],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const simulationChildEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, childID)!
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.reparentObject([authoringNode2Entity], authoringChildEntity, null, authoringNodeEntity)

      await flushAll()

      const newEntity = getComponent(authoringNodeEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, authoringNode2Entity)
      assert.equal(getComponent(newEntity, UUIDComponent).entityID, node2ID)
    })

    it('should reparent inside root node', async () => {
      const node1UUID = UUIDComponent.generateUUID()
      const node2ID = 'node2ID' as EntityID
      const node3ID = 'node3ID' as EntityID
      const node4ID = 'node4ID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0, 1, 2, 3] }],
        scene: 0,
        nodes: [
          {
            name: 'node1',
            extensions: {
              [UUIDComponent.jsonID]: node1UUID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'node3',
            extensions: {
              [UUIDComponent.jsonID]: node3ID
            }
          },
          {
            name: 'node4',
            extensions: {
              [UUIDComponent.jsonID]: node4ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNode2Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const simulationNode4Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node4ID)!
      const authoringNode4Entity = LayerFunctions.getAuthoringCounterpart(simulationNode4Entity)

      EditorControlFunctions.reparentObject([authoringNode4Entity], undefined, authoringNode2Entity, rootEntity)

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[2]
      assert.equal(newEntity, authoringNode4Entity)
      assert.equal(getComponent(newEntity, UUIDComponent).entityID, node4ID)
    })

    it('should reparent to another source', async () => {
      const node1ID = 'node1ID' as EntityID
      const node2ID = 'node2ID' as EntityID
      const node3ID = 'node3ID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0, 1] }],
        scene: 0,
        nodes: [
          {
            name: 'node1',
            extensions: {
              [UUIDComponent.jsonID]: node1ID,
              [GLTFComponent.jsonID]: {
                src: '/sub-asset.gltf'
              }
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2ID
            }
          }
        ]
      }

      const subAssetGLTF: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node3',
            extensions: {
              [UUIDComponent.jsonID]: node3ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      Cache.add('/sub-asset.gltf', subAssetGLTF)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNode1Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node1ID)!

      const simulationNode2Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const subAssetSourceID = GLTFComponent.getSourceID(simulationNode1Entity)

      const simulationNode3Entity = UUIDComponent.getEntityByUUID((subAssetSourceID + node3ID) as EntityUUID)
      const authoringNode3Entity = LayerFunctions.getAuthoringCounterpart(simulationNode3Entity)

      EditorControlFunctions.reparentObject([authoringNode2Entity], null, null, authoringNode3Entity)

      await flushAll()

      const reparentedSimulationNode2Entity = GLTFComponent.getEntityBySourceAndID(authoringNode3Entity, node2ID)!
      const reparentedAuthoringNode2Entity = LayerFunctions.getAuthoringCounterpart(reparentedSimulationNode2Entity)

      assert.equal(reparentedAuthoringNode2Entity, authoringNode2Entity)
      assert.equal(getComponent(reparentedAuthoringNode2Entity, UUIDComponent).entityID, node2ID)
      assert.equal(
        getComponent(reparentedAuthoringNode2Entity, UUIDComponent).entitySourceID,
        getComponent(authoringNode3Entity, UUIDComponent).entitySourceID
      )
      assert.equal(getComponent(reparentedAuthoringNode2Entity, EntityTreeComponent).parentEntity, authoringNode3Entity)
      const expectedUUID = UUIDComponent.get(simulationNode1Entity) + node2ID
      assert.equal(UUIDComponent.get(reparentedAuthoringNode2Entity), expectedUUID)
    })
  })

  describe('groupObjects', () => {
    it('should group objects without affecting existing hierarchy relationships', async () => {
      const nodeID = 'nodeID' as EntityID
      const node2ID = 'node2ID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0, 1] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [2],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      EditorControlFunctions.groupObjects([authoringNodeEntity, authoringNode2Entity])

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[0]
      assert.equal(getComponent(newEntity, EntityTreeComponent).children[0], authoringNodeEntity)
      assert.equal(getComponent(newEntity, EntityTreeComponent).children[1], authoringNode2Entity)
      assert(hasComponent(newEntity, UUIDComponent))
      assert(hasComponent(newEntity, VisibleComponent))
      assert(hasComponent(newEntity, TransformComponent))
      assert.equal(getComponent(newEntity, NameComponent), 'New Group')
    })
  })

  describe('removeObject', () => {
    it('should remove an object and children from the scene', async () => {
      const nodeID = 'nodeID' as EntityID
      const node2ID = 'node2ID' as EntityID
      const node3ID = 'node3ID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0, 1, 3] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [2],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID
            }
          },
          {
            name: 'node3',
            extensions: {
              [UUIDComponent.jsonID]: node3ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const simulationNode3Entity = GLTFComponent.getEntityBySourceAndID(rootEntity, node3ID)!
      const authoringNode3Entity = LayerFunctions.getAuthoringCounterpart(simulationNode3Entity)

      EditorControlFunctions.removeObject([authoringNodeEntity])

      await flushAll()

      assert.equal(getComponent(rootEntity, EntityTreeComponent).children[0], authoringNode2Entity)
      assert.equal(getComponent(rootEntity, EntityTreeComponent).children[1], authoringNode3Entity)

      assert.equal(GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID), UndefinedEntity)!
      assert.equal(GLTFComponent.getEntityBySourceAndID(rootEntity, childID), UndefinedEntity)!
    })
  })

  describe('overwriteLookdevObject', () => {
    it('should overwrite a lookdev object with new components', async () => {
      const nodeID = 'nodeID' as EntityID
      const childID = 'childID' as EntityID

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node',
            children: [1],
            extensions: {
              [UUIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childID,
              [HemisphereLightComponent.jsonID]: {
                skyColor: new Color('purple').getHex(),
                groundColor: new Color('green').getHex(),
                intensity: 0.5
              }
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = GLTFComponent.getEntityBySourceAndID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      EditorControlFunctions.overwriteLookdevObject(
        [
          {
            name: HemisphereLightComponent.jsonID,
            props: {
              skyColor: new Color('blue').getHex(),
              groundColor: new Color('red').getHex(),
              intensity: 0.7
            }
          }
        ],
        rootEntity
      )

      await flushAll()

      const childEntity = getComponent(authoringNodeEntity, EntityTreeComponent).children[0]

      const hemisphereLightComponent = getComponent(childEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })
  })
})
