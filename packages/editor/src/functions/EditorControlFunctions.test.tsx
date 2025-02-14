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
import { Cache, Color } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import { UserID } from '@ir-engine/common/src/schema.type.module'
import {
  createEntity,
  EngineState,
  getComponent,
  hasComponent,
  Layers,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity, EntityUUID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { getMutableState } from '@ir-engine/hyperflux'
import { HemisphereLightComponent, TransformComponent } from '@ir-engine/spatial'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { startEngineReactor } from '@ir-engine/engine/tests/startEngineReactor'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
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

    await Physics.load()
    physicsWorldEntity = createEntity()
    setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)
    const physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60

    startEngineReactor()
  })

  afterEach(() => {
    Cache.enabled = false
    return destroyEngine()
  })

  describe('addOrRemoveComponent', () => {
    it('should add and remove component from root child', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)

      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

      assert(nodeEntity)

      EditorControlFunctions.addOrRemoveComponent([nodeEntity], VisibleComponent, true)

      assert(hasComponent(nodeEntity, VisibleComponent))

      EditorControlFunctions.addOrRemoveComponent([nodeEntity], VisibleComponent, false)

      assert(!hasComponent(nodeEntity, VisibleComponent))
    })

    it('should add and remove component from root child', async () => {
      const nodeUUID = UUIDComponent.generateUUID()
      const childUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)

      await waitForScene(rootEntity)

      const childEntity = UUIDComponent.getEntityByUUID(childUUID, Layers.Authoring)

      EditorControlFunctions.addOrRemoveComponent([childEntity], VisibleComponent, true)

      assert(hasComponent(childEntity, VisibleComponent))

      EditorControlFunctions.addOrRemoveComponent([childEntity], VisibleComponent, false)

      assert(!hasComponent(childEntity, VisibleComponent))
    })
  })

  describe('modifyName', () => {
    it('should modify the name of a node', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

      EditorControlFunctions.modifyName([nodeEntity], 'newName')

      assert.equal(getComponent(nodeEntity, NameComponent), 'newName')
    })
  })

  describe('modifyProperty', () => {
    it('should modify the property of a node', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID,
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

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

      EditorControlFunctions.modifyProperty([nodeEntity], HemisphereLightComponent, {
        skyColor: new Color('blue'),
        groundColor: new Color('red'),
        intensity: 0.7
      })

      const hemisphereLightComponent = getComponent(nodeEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
    })
    it('should modify a nested property of a node', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID,
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

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

      EditorControlFunctions.modifyProperty([nodeEntity], SplineComponent, {
        [`elements.${1}.position` as string]: {
          x: 10,
          y: 10,
          z: 10
        }
      })

      const splineComponent = getComponent(nodeEntity, SplineComponent)
      assert.equal(splineComponent.elements[1].position.x, 10)
      assert.equal(splineComponent.elements[1].position.y, 10)
      assert.equal(splineComponent.elements[1].position.z, 10)
    })
  })

  describe('createObjectFromSceneElement', () => {
    it('should create a new object from a scene element to root', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
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

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, rootEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })

    it('should create a new object from a scene element as child of node', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

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
        nodeEntity
      )

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, nodeEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })

    it('should create a new object from a scene element before node', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

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
        nodeEntity
      )

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
      const nodeUUID = UUIDComponent.generateUUID()
      const childUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)
      const childEntity = UUIDComponent.getEntityByUUID(childUUID, Layers.Authoring)

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
        nodeEntity,
        childEntity
      )

      const newEntity = UUIDComponent.getEntityByUUID(entityUUID, Layers.Authoring)
      assert(newEntity)
      assert.equal(getComponent(newEntity, NameComponent), 'New Object')
      assert.equal(getComponent(newEntity, EntityTreeComponent).parentEntity, nodeEntity)

      const hemisphereLightComponent = getComponent(newEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })
  })

  describe('duplicateObject', () => {
    it('should duplicate an object to root', async () => {
      const nodeUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID,
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

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

      EditorControlFunctions.duplicateObject([nodeEntity])

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
      const nodeUUID = UUIDComponent.generateUUID()
      const childUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const childEntity = UUIDComponent.getEntityByUUID(childUUID, Layers.Authoring)

      EditorControlFunctions.reparentObject([childEntity], null, null, rootEntity)

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[1]
      assert(newEntity)
      assert.equal(getComponent(newEntity, UUIDComponent), childUUID)
    })

    it('should reparent an object to another object', async () => {
      const nodeUUID = UUIDComponent.generateUUID()
      const node2UUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2UUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)
      const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)

      EditorControlFunctions.reparentObject([node2Entity], null, null, nodeEntity)

      const newEntity = getComponent(nodeEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, node2Entity)
      assert.equal(getComponent(newEntity, UUIDComponent), node2UUID)
    })

    it('should reparent a child node to root before another node', async () => {
      const nodeUUID = UUIDComponent.generateUUID()
      const childUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)
      const childEntity = UUIDComponent.getEntityByUUID(childUUID, Layers.Authoring)

      EditorControlFunctions.reparentObject([childEntity], nodeEntity, null, rootEntity)

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, childEntity)
      assert.equal(getComponent(newEntity, UUIDComponent), childUUID)
    })

    it('should reparent an object to another object before other object', async () => {
      const nodeUUID = UUIDComponent.generateUUID()
      const node2UUID = UUIDComponent.generateUUID()
      const childUUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2UUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)
      const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)
      const childEntity = UUIDComponent.getEntityByUUID(childUUID, Layers.Authoring)

      EditorControlFunctions.reparentObject([node2Entity], childEntity, null, nodeEntity)

      const newEntity = getComponent(nodeEntity, EntityTreeComponent).children[0]
      assert.equal(newEntity, node2Entity)
      assert.equal(getComponent(newEntity, UUIDComponent), node2UUID)
    })

    it('should reparent inside root node', async () => {
      const node1UUID = UUIDComponent.generateUUID()
      const node2UUID = UUIDComponent.generateUUID()
      const node3UUID = UUIDComponent.generateUUID()
      const node4UUID = UUIDComponent.generateUUID()

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
              [UUIDComponent.jsonID]: node2UUID
            }
          },
          {
            name: 'node3',
            extensions: {
              [UUIDComponent.jsonID]: node3UUID
            }
          },
          {
            name: 'node4',
            extensions: {
              [UUIDComponent.jsonID]: node4UUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)
      const node4Entity = UUIDComponent.getEntityByUUID(node4UUID, Layers.Authoring)

      EditorControlFunctions.reparentObject([node4Entity], undefined, node2Entity, rootEntity)

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[2]
      assert.equal(newEntity, node4Entity)
      assert.equal(getComponent(newEntity, UUIDComponent), node4UUID)
    })
  })

  describe('groupObjects', () => {
    it('should group objects without affecting existing hierarchy relationships', async () => {
      const nodeUUID = 'nodeUUID' as EntityUUID
      const node2UUID = 'node2UUID' as EntityUUID
      const childUUID = 'childUUID' as EntityUUID

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2UUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)
      const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)

      EditorControlFunctions.groupObjects([nodeEntity, node2Entity])

      const newEntity = getComponent(rootEntity, EntityTreeComponent).children[0]
      assert.equal(getComponent(newEntity, EntityTreeComponent).children[0], nodeEntity)
      assert.equal(getComponent(newEntity, EntityTreeComponent).children[1], node2Entity)
      assert(hasComponent(newEntity, UUIDComponent))
      assert(hasComponent(newEntity, VisibleComponent))
      assert(hasComponent(newEntity, TransformComponent))
      assert.equal(getComponent(newEntity, NameComponent), 'New Group')
    })
  })

  describe('removeObject', () => {
    it('should remove an object and children from the scene', async () => {
      const nodeUUID = 'nodeUUID' as EntityUUID
      const node2UUID = 'node2UUID' as EntityUUID
      const node3UUID = 'node3UUID' as EntityUUID
      const childUUID = 'childUUID' as EntityUUID

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'node2',
            extensions: {
              [UUIDComponent.jsonID]: node2UUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID
            }
          },
          {
            name: 'node3',
            extensions: {
              [UUIDComponent.jsonID]: node3UUID
            }
          }
        ]
      }

      Cache.add('/test.gltf', gltf)
      const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
      getMutableState(EditorState).rootEntity.set(rootEntity)
      await waitForScene(rootEntity)

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)
      const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)
      const node3Entity = UUIDComponent.getEntityByUUID(node3UUID, Layers.Authoring)

      EditorControlFunctions.removeObject([nodeEntity])

      assert.equal(getComponent(rootEntity, EntityTreeComponent).children[0], node2Entity)
      assert.equal(getComponent(rootEntity, EntityTreeComponent).children[1], node3Entity)

      assert.equal(UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring), UndefinedEntity)
      assert.equal(UUIDComponent.getEntityByUUID(childUUID, Layers.Authoring), UndefinedEntity)
    })
  })

  describe('overwriteLookdevObject', () => {
    it('should overwrite a lookdev object with new components', async () => {
      const nodeUUID = 'nodeUUID' as EntityUUID
      const childUUID = 'childUUID' as EntityUUID

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
              [UUIDComponent.jsonID]: nodeUUID
            }
          },
          {
            name: 'child',
            extensions: {
              [UUIDComponent.jsonID]: childUUID,
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

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID, Layers.Authoring)

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

      const childEntity = getComponent(nodeEntity, EntityTreeComponent).children[0]

      const hemisphereLightComponent = getComponent(childEntity, HemisphereLightComponent)
      assert.deepEqual(hemisphereLightComponent.skyColor, new Color('blue'))
      assert.deepEqual(hemisphereLightComponent.groundColor, new Color('red'))
      assert.equal(hemisphereLightComponent.intensity, 0.7)
    })
  })
})
