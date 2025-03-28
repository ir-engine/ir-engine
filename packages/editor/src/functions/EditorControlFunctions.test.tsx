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
  defineComponent,
  EngineState,
  getComponent,
  hasComponent,
  LayerFunctions,
  Layers,
  removeEntity,
  S,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { HemisphereLightComponent, TransformComponent } from '@ir-engine/spatial'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeFunctions } from '@ir-engine/engine/src/gltf/NodeFunctions'
import { NodeID, NodeIDComponent, NodesBySourceState } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { SceneDeltaState } from '@ir-engine/engine/src/scene/systems/SceneDeltaState'
import { startEngineReactor } from '@ir-engine/engine/tests/startEngineReactor'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
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
    setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)

      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)
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
      const nodeID = NodeIDComponent.generate()
      const childID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)

      await waitForScene(rootEntity)

      const simulationChildEntity = NodeFunctions.getEntityFromNodeID(rootEntity, childID)!
      assert(simulationChildEntity)

      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.addOrRemoveComponent([authoringChildEntity], VisibleComponent, true)

      await flushAll()

      assert(hasComponent(authoringChildEntity, VisibleComponent))

      EditorControlFunctions.addOrRemoveComponent([authoringChildEntity], VisibleComponent, false)

      await flushAll()

      assert(!hasComponent(authoringChildEntity, VisibleComponent))
    })

    it('registers a delta for adding a component', async () => {
      const node1ID = NodeIDComponent.generate()
      const node2ID = NodeIDComponent.generate()

      const gltf: GLTF.IGLTF = {
        asset: {
          version: '2.0'
        },
        scenes: [{ nodes: [0] }],
        scene: 0,
        nodes: [
          {
            name: 'node1',
            extensions: {
              [NodeIDComponent.jsonID]: node1ID,
              [GLTFComponent.jsonID]: {
                src: '/sub-asset.gltf'
              }
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
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      Cache.add('/sub-asset.gltf', subAssetGLTF)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNode1Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node1ID)!
      const subAssetSourceID = GLTFComponent.getInstanceID(simulationNode1Entity)
      const simulationNode3Entity = UUIDComponent.getEntityByUUID(
        NodeIDComponent.getUUIDBySourceAndNodeID(subAssetSourceID, node2ID)!
      )
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode3Entity)

      const testComponent = defineComponent({
        name: 'TestComponent',
        jsonID: 'EE_test',
        schema: S.Object({
          value: S.Number(0)
        })
      })

      const testValue = Math.random()
      EditorControlFunctions.addOrRemoveComponent([authoringNode2Entity], testComponent, true, { value: testValue })

      await flushAll()

      const deltaState = getState(SceneDeltaState)
      assert.equal(deltaState[node1ID][node2ID][testComponent.jsonID].value, testValue)
    })
  })

  describe('updateMaterialPrototype', () => {
    let materialEntity = UndefinedEntity

    beforeEach(() => {
      materialEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(materialEntity)
    })
    class MockMaterial {
      constructor() {}
    }

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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      assert(simulationNodeEntity)

      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      EditorControlFunctions.modifyName([authoringChildEntity], 'newName')

      await flushAll()

      assert.equal(getComponent(authoringChildEntity, NameComponent), 'newName')
    })
  })

  describe('modifyProperty', () => {
    it('should modify the property of a node', async () => {
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID,
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

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID,
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

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
      const nodeID = NodeIDComponent.generate()
      const childID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationChildEntity = NodeFunctions.getEntityFromNodeID(rootEntity, childID)!
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
      const nodeID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID,
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

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
      const nodeID = NodeIDComponent.generate()
      const childID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationChildEntity = NodeFunctions.getEntityFromNodeID(rootEntity, childID)!
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.reparentObject([authoringChildEntity], null, null, rootEntity)

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[1]
      assert(newEntity)
      assert.equal(getComponent(newEntity, NodeIDComponent), childID)
    })

    it('should reparent an object to another object', async () => {
      const nodeID = NodeIDComponent.generate()
      const node2ID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      EditorControlFunctions.reparentObject([authoringNode2Entity], null, null, authoringNodeEntity)

      await flushAll()

      const newEntity = getComponent(authoringNodeEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, authoringNode2Entity)
      assert.equal(getComponent(newEntity, NodeIDComponent), node2ID)
    })

    it('should reparent a child node to root before another node', async () => {
      const nodeID = NodeIDComponent.generate()
      const childID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationChildEntity = NodeFunctions.getEntityFromNodeID(rootEntity, childID)!
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.reparentObject([authoringChildEntity], authoringNodeEntity, null, rootEntity)

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, authoringChildEntity)
      assert.equal(getComponent(newEntity, NodeIDComponent), childID)
    })

    it('should reparent an object to another object before other object', async () => {
      const nodeID = NodeIDComponent.generate()
      const node2ID = NodeIDComponent.generate()
      const childID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const simulationChildEntity = NodeFunctions.getEntityFromNodeID(rootEntity, childID)!
      const authoringChildEntity = LayerFunctions.getAuthoringCounterpart(simulationChildEntity)

      EditorControlFunctions.reparentObject([authoringNode2Entity], authoringChildEntity, null, authoringNodeEntity)

      await flushAll()

      const newEntity = getComponent(authoringNodeEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, authoringNode2Entity)
      assert.equal(getComponent(newEntity, NodeIDComponent), node2ID)
    })

    it('should reparent inside root node', async () => {
      const node1UUID = NodeIDComponent.generate()
      const node2ID = NodeIDComponent.generate()
      const node3ID = NodeIDComponent.generate()
      const node4ID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: node1UUID
            }
          },
          {
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'node3',
            extensions: {
              [NodeIDComponent.jsonID]: node3ID
            }
          },
          {
            name: 'node4',
            extensions: {
              [NodeIDComponent.jsonID]: node4ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNode2Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const simulationNode4Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node4ID)!
      const authoringNode4Entity = LayerFunctions.getAuthoringCounterpart(simulationNode4Entity)

      EditorControlFunctions.reparentObject([authoringNode4Entity], undefined, authoringNode2Entity, rootEntity)

      await flushAll()

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[2]
      assert.equal(newEntity, authoringNode4Entity)
      assert.equal(getComponent(newEntity, NodeIDComponent), node4ID)
    })

    it('should reparent to another source', async () => {
      const node1ID = NodeIDComponent.generate()
      const node2ID = NodeIDComponent.generate()
      const node3ID = NodeIDComponent.generate()

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
              [NodeIDComponent.jsonID]: node1ID,
              [GLTFComponent.jsonID]: {
                src: '/sub-asset.gltf'
              }
            }
          },
          {
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
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
              [NodeIDComponent.jsonID]: node3ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      Cache.add('/sub-asset.gltf', subAssetGLTF)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNode1Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node1ID)!

      const simulationNode2Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const subAssetSourceID = GLTFComponent.getInstanceID(simulationNode1Entity)

      const simulationNode3Entity = UUIDComponent.getEntityByUUID(
        NodeIDComponent.getUUIDBySourceAndNodeID(subAssetSourceID, node3ID)!
      )
      const authoringNode3Entity = LayerFunctions.getAuthoringCounterpart(simulationNode3Entity)

      EditorControlFunctions.reparentObject([authoringNode2Entity], null, null, authoringNode3Entity)

      await flushAll()

      await vi.waitUntil(() => getState(NodesBySourceState)[subAssetSourceID][node3ID])

      const reparentedSimulationNode2Entity = NodeFunctions.getEntityFromNodeID(authoringNode3Entity, node2ID)!
      const reparentedAuthoringNode2Entity = LayerFunctions.getAuthoringCounterpart(reparentedSimulationNode2Entity)

      assert.equal(reparentedAuthoringNode2Entity, authoringNode2Entity)
      assert.equal(getComponent(reparentedAuthoringNode2Entity, NodeIDComponent), node2ID)
      assert.equal(
        getComponent(reparentedAuthoringNode2Entity, SourceComponent),
        getComponent(authoringNode3Entity, SourceComponent)
      )
      assert.equal(getComponent(reparentedAuthoringNode2Entity, EntityTreeComponent).parentEntity, authoringNode3Entity)
      const expectedUUID = NodeIDComponent.getUUIDBySourceAndNodeID(subAssetSourceID, node2ID)
      assert.equal(getComponent(reparentedAuthoringNode2Entity, UUIDComponent), expectedUUID)
    })
  })

  describe('groupObjects', () => {
    it('should group objects without affecting existing hierarchy relationships', async () => {
      const nodeID = 'nodeID' as NodeID
      const node2ID = 'node2ID' as NodeID
      const childID = 'childID' as NodeID

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node2ID)!
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
      const nodeID = 'nodeID' as NodeID
      const node2ID = 'node2ID' as NodeID
      const node3ID = 'node3ID' as NodeID
      const childID = 'childID' as NodeID

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'node2',
            extensions: {
              [NodeIDComponent.jsonID]: node2ID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID
            }
          },
          {
            name: 'node3',
            extensions: {
              [NodeIDComponent.jsonID]: node3ID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
      const authoringNodeEntity = LayerFunctions.getAuthoringCounterpart(simulationNodeEntity)

      const simulationNode2Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node2ID)!
      const authoringNode2Entity = LayerFunctions.getAuthoringCounterpart(simulationNode2Entity)

      const simulationNode3Entity = NodeFunctions.getEntityFromNodeID(rootEntity, node3ID)!
      const authoringNode3Entity = LayerFunctions.getAuthoringCounterpart(simulationNode3Entity)

      EditorControlFunctions.removeObject([authoringNodeEntity])

      await flushAll()

      assert.equal(getComponent(rootEntity, EntityTreeComponent).children[0], authoringNode2Entity)
      assert.equal(getComponent(rootEntity, EntityTreeComponent).children[1], authoringNode3Entity)

      assert.equal(NodeFunctions.getEntityFromNodeID(rootEntity, nodeID), UndefinedEntity)!
      assert.equal(NodeFunctions.getEntityFromNodeID(rootEntity, childID), UndefinedEntity)!
    })
  })

  describe('overwriteLookdevObject', () => {
    it('should overwrite a lookdev object with new components', async () => {
      const nodeID = 'nodeID' as NodeID
      const childID = 'childID' as NodeID

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
              [NodeIDComponent.jsonID]: nodeID
            }
          },
          {
            name: 'child',
            extensions: {
              [NodeIDComponent.jsonID]: childID,
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

      const simulationNodeEntity = NodeFunctions.getEntityFromNodeID(rootEntity, nodeID)!
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
