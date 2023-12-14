/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { applyIncomingActions, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { EventDispatcher } from '../../common/classes/EventDispatcher'
import { Engine, destroyEngine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { SceneSnapshotAction, SceneState } from '../../ecs/classes/Scene'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { SystemDefinitions } from '../../ecs/functions/SystemFunctions'
import { createEngine } from '../../initializeEngine'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { SceneDataType, SceneID, SceneJsonType } from '../../schemas/projects/scene.schema'
import { UserID } from '../../schemas/user/user.schema'
import { FogSettingsComponent } from '../components/FogSettingsComponent'
import { ModelComponent } from '../components/ModelComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { SceneLoadingSystem } from './SceneLoadingSystem'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'

const testScene = {
  name: '',
  thumbnailUrl: '',
  project: '',
  scenePath: 'test' as SceneID,
  scene: {
    entities: {
      root: {
        name: 'Root',
        components: []
      },
      child_0: {
        name: 'Child 0',
        components: [
          {
            name: 'transform',
            props: {
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
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          },
          {
            name: 'gltf-model',
            props: {
              src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
              generateBVH: true,
              avoidCameraOcclusion: false
            }
          }
        ],
        parent: 'root'
      },
      child_1: {
        name: 'Child 1',
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: 1,
                y: 0,
                z: 0
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          }
        ],
        parent: 'child_0'
      },
      child_2: {
        name: 'Child 2',
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: 0,
                y: 1,
                z: 0
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          }
        ],
        parent: 'child_1'
      },
      child_3: {
        name: 'Child 3',
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: 0,
                y: 0,
                z: 1
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          }
        ],
        parent: 'child_2'
      },
      child_4: {
        name: 'Child 4',
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: 2,
                y: 0,
                z: 0
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          }
        ],
        parent: 'child_3'
      },
      child_5: {
        name: 'Child 5',
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: 0,
                y: 2,
                z: 0
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          }
        ],
        parent: 'child_4'
      },
      child_2_1: {
        name: 'Child 2 _ 1',
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: 0,
                y: 0,
                z: 2
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
              },
              scale: {
                x: 1,
                y: 1,
                z: 1
              }
            }
          },
          {
            name: 'fog',
            props: {
              type: 'linear',
              color: '#FFFFFF',
              density: 0.005,
              near: 1,
              far: 1000,
              timeScale: 1,
              height: 0.05
            }
          }
        ],
        parent: 'child_2'
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJsonType
} as SceneDataType
const testID = 'test' as SceneID

describe('SceneLoadingSystem', () => {
  beforeEach(() => {
    createEngine()
    Engine.instance.userID = 'user' as UserID

    const eventDispatcher = new EventDispatcher()
    ;(Engine.instance.api as any) = {
      service: () => {
        return {
          on: (serviceName, cb) => {
            eventDispatcher.addEventListener(serviceName, cb)
          },
          off: (serviceName, cb) => {
            eventDispatcher.removeEventListener(serviceName, cb)
          }
        }
      }
    }
  })

  it('will load entities', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init

    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />

    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )

    const child1Entity = UUIDComponent.entitiesByUUID['child_1']
    assert(child1Entity, 'child_1 entity not found')
    assert.equal(
      hasComponent(child1Entity, EntityTreeComponent),
      true,
      'child_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child1Entity, EntityTreeComponent).parentEntity,
      child0Entity,
      'child_1 entity does not have parentEntity as child_0 entity'
    )

    const child2Entity = UUIDComponent.entitiesByUUID['child_2']
    assert(child2Entity, 'child_2 entity not found')
    assert.equal(
      hasComponent(child2Entity, EntityTreeComponent),
      true,
      'child_2 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2Entity, EntityTreeComponent).parentEntity,
      child1Entity,
      'child_2 entity does not have parentEntity as child_1 entity'
    )

    const child3Entity = UUIDComponent.entitiesByUUID['child_3']
    assert(child3Entity, 'child_3 entity not found')
    assert.equal(
      hasComponent(child3Entity, EntityTreeComponent),
      true,
      'child_3 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child3Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_3 entity does not have parentEntity as child_2 entity'
    )

    const child4Entity = UUIDComponent.entitiesByUUID['child_4']
    assert(child4Entity, 'child_4 entity not found')
    assert.equal(
      hasComponent(child4Entity, EntityTreeComponent),
      true,
      'child_4 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child4Entity, EntityTreeComponent).parentEntity,
      child3Entity,
      'child_4 entity does not have parentEntity as child_3 entity'
    )

    const child5Entity = UUIDComponent.entitiesByUUID['child_5']
    assert(child5Entity, 'child_5 entity not found')
    assert.equal(
      hasComponent(child5Entity, EntityTreeComponent),
      true,
      'child_5 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child5Entity, EntityTreeComponent).parentEntity,
      child4Entity,
      'child_5 entity does not have parentEntity as child_4 entity'
    )

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity, 'child_2_1 entity not found')
    assert.equal(
      hasComponent(child2_1Entity, EntityTreeComponent),
      true,
      'child_2_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_2_1 entity does not have parentEntity as child_2 entity'
    )
    // check all entites are loaded correctly
    // check if data in the manual json matches scene data
    console.log(UUIDComponent.entitiesByUUID)
    // unmount to cleanup
    unmount()
  })
  it('will load correct data', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />
    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity, 'child_2_1 entity not found')
    assert.equal(
      hasComponent(child2_1Entity, EntityTreeComponent),
      true,
      'child_2_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      hasComponent(child2_1Entity, FogSettingsComponent),
      true,
      'child_2_1 entity does not have FogSettingsComponent'
    )
    const fog = getComponent(child2_1Entity, FogSettingsComponent)
    const originalfogData = testScene.scene.entities['child_2_1'].components.filter(
      (component) => component.name === 'fog'
    )[0]
    assert.deepStrictEqual(fog, originalfogData.props, 'fog component does not match')

    // unmount to cleanup
    unmount()
  })
  it('will not load dynamic entity', async () => {
    // wont load unless we simulate the avatar and its distance from the dynamic entity
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)
    // its easier to just add the component to the scene and remove it at the end
    const dynamicLoadJson = {
      name: 'dynamic-load',
      props: {
        mode: 'distance',
        distance: 2,
        loaded: false
      }
    }

    testScene.scene.entities['child_0'].components.push(dynamicLoadJson)
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />

    // load scene

    // init
    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )

    // check for failure to load
    const child1Entity = UUIDComponent.entitiesByUUID['child_1']
    assert.equal(child1Entity, undefined, 'child_1 entity found')
    testScene.scene.entities['child_0'].components = testScene.scene.entities['child_0'].components.filter(
      (component) => component.name !== 'dynamic-load'
    )

    unmount()
  })
  it('will load dynamic entity in studio', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).isEditing.set(true)

    // its easier to just add the component to the scene and remove it at the end
    const dynamicLoadJson = {
      name: 'dynamic-load',
      props: {
        mode: 'distance',
        distance: 2,
        loaded: false
      }
    }

    testScene.scene.entities['child_0'].components.push(dynamicLoadJson)
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />
    // set to location mode

    // load scene

    // init
    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )

    const child1Entity = UUIDComponent.entitiesByUUID['child_1']
    assert(child1Entity, 'child_1 entity not found')
    assert.equal(
      hasComponent(child1Entity, EntityTreeComponent),
      true,
      'child_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child1Entity, EntityTreeComponent).parentEntity,
      child0Entity,
      'child_1 entity does not have parentEntity as child_0 entity'
    )

    const child2Entity = UUIDComponent.entitiesByUUID['child_2']
    assert(child2Entity, 'child_2 entity not found')
    assert.equal(
      hasComponent(child2Entity, EntityTreeComponent),
      true,
      'child_2 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2Entity, EntityTreeComponent).parentEntity,
      child1Entity,
      'child_2 entity does not have parentEntity as child_1 entity'
    )

    const child3Entity = UUIDComponent.entitiesByUUID['child_3']
    assert(child3Entity, 'child_3 entity not found')
    assert.equal(
      hasComponent(child3Entity, EntityTreeComponent),
      true,
      'child_3 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child3Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_3 entity does not have parentEntity as child_2 entity'
    )

    const child4Entity = UUIDComponent.entitiesByUUID['child_4']
    assert(child4Entity, 'child_4 entity not found')
    assert.equal(
      hasComponent(child4Entity, EntityTreeComponent),
      true,
      'child_4 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child4Entity, EntityTreeComponent).parentEntity,
      child3Entity,
      'child_4 entity does not have parentEntity as child_3 entity'
    )

    const child5Entity = UUIDComponent.entitiesByUUID['child_5']
    assert(child5Entity, 'child_5 entity not found')
    assert.equal(
      hasComponent(child5Entity, EntityTreeComponent),
      true,
      'child_5 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child5Entity, EntityTreeComponent).parentEntity,
      child4Entity,
      'child_5 entity does not have parentEntity as child_4 entity'
    )

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity, 'child_2_1 entity not found')
    assert.equal(
      hasComponent(child2_1Entity, EntityTreeComponent),
      true,
      'child_2_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_2_1 entity does not have parentEntity as child_2 entity'
    )
    console.log(UUIDComponent.entitiesByUUID)
    testScene.scene.entities['child_0'].components = testScene.scene.entities['child_0'].components.filter(
      (component) => component.name !== 'dynamic-load'
    )
    unmount()
  })
  it('will load sub-scene from model component', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />

    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )
    // load scene with model component

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )
    // check for success of model component

    assert.equal(hasComponent(child0Entity, ModelComponent), true, 'child_0 entity does not have ModelComponent')

    await act(() => rerender(tag))
    const tree = getComponent(child0Entity, EntityTreeComponent)

    // check for model component children //not loading
    unmount()
  })
  it('will have sceneAssetPendingTagQuery when loading', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init

    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />

    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render

    const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent]).enter

    const inLoadingEntities = sceneAssetPendingTagQuery()

    assert(inLoadingEntities.length > 0, 'no sceneAssetPendingTag found when loading')
    //while loading
    for (const entity of inLoadingEntities) {
      if (entity === SceneState.getRootEntity(testID)) {
        assert.equal(
          hasComponent(entity, SceneAssetPendingTagComponent),
          true,
          'root entity does not have SceneAssetPendingTagComponent'
        )
      }
    }

    await act(() => {
      rerender(tag)
    })

    //after loading
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      !hasComponent(rootEntity, SceneAssetPendingTagComponent),
      true,
      'root entity has SceneAssetPendingTagComponent after loading'
    )

    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )

    const child1Entity = UUIDComponent.entitiesByUUID['child_1']
    assert(child1Entity, 'child_1 entity not found')
    assert.equal(
      hasComponent(child1Entity, EntityTreeComponent),
      true,
      'child_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child1Entity, EntityTreeComponent).parentEntity,
      child0Entity,
      'child_1 entity does not have parentEntity as child_0 entity'
    )

    const child2Entity = UUIDComponent.entitiesByUUID['child_2']
    assert(child2Entity, 'child_2 entity not found')
    assert.equal(
      hasComponent(child2Entity, EntityTreeComponent),
      true,
      'child_2 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2Entity, EntityTreeComponent).parentEntity,
      child1Entity,
      'child_2 entity does not have parentEntity as child_1 entity'
    )

    const child3Entity = UUIDComponent.entitiesByUUID['child_3']
    assert(child3Entity, 'child_3 entity not found')
    assert.equal(
      hasComponent(child3Entity, EntityTreeComponent),
      true,
      'child_3 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child3Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_3 entity does not have parentEntity as child_2 entity'
    )

    const child4Entity = UUIDComponent.entitiesByUUID['child_4']
    assert(child4Entity, 'child_4 entity not found')
    assert.equal(
      hasComponent(child4Entity, EntityTreeComponent),
      true,
      'child_4 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child4Entity, EntityTreeComponent).parentEntity,
      child3Entity,
      'child_4 entity does not have parentEntity as child_3 entity'
    )

    const child5Entity = UUIDComponent.entitiesByUUID['child_5']
    assert(child5Entity, 'child_5 entity not found')
    assert.equal(
      hasComponent(child5Entity, EntityTreeComponent),
      true,
      'child_5 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child5Entity, EntityTreeComponent).parentEntity,
      child4Entity,
      'child_5 entity does not have parentEntity as child_4 entity'
    )

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity, 'child_2_1 entity not found')
    assert.equal(
      hasComponent(child2_1Entity, EntityTreeComponent),
      true,
      'child_2_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_2_1 entity does not have parentEntity as child_2 entity'
    )

    // check all entites are loaded correctly
    // check if data in the manual json matches scene data
    // unmount to cleanup
    unmount()
  })
  afterEach(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined
    return destroyEngine()
  })
})

describe('Snapshots', () => {
  beforeEach(() => {
    createEngine()
    getMutableState(EngineState).isEditing.set(true)

    Engine.instance.userID = 'user' as UserID

    const eventDispatcher = new EventDispatcher()
    ;(Engine.instance.api as any) = {
      service: () => {
        return {
          on: (serviceName, cb) => {
            eventDispatcher.addEventListener(serviceName, cb)
          },
          off: (serviceName, cb) => {
            eventDispatcher.removeEventListener(serviceName, cb)
          }
        }
      }
    }
  })

  it('create snapshot', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init
    const SceneReactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const sceneTag = <SceneReactor />

    SceneState.loadScene(testID, testScene)

    // render
    const { rerender: load, unmount: unmountSceneLoader } = render(sceneTag)

    // load scene
    // force re-render
    await act(() => load(sceneTag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )

    const child1Entity = UUIDComponent.entitiesByUUID['child_1']
    assert(child1Entity, 'child_1 entity not found')
    assert.equal(
      hasComponent(child1Entity, EntityTreeComponent),
      true,
      'child_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child1Entity, EntityTreeComponent).parentEntity,
      child0Entity,
      'child_1 entity does not have parentEntity as child_0 entity'
    )

    const child2Entity = UUIDComponent.entitiesByUUID['child_2']
    assert(child2Entity, 'child_2 entity not found')
    assert.equal(
      hasComponent(child2Entity, EntityTreeComponent),
      true,
      'child_2 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2Entity, EntityTreeComponent).parentEntity,
      child1Entity,
      'child_2 entity does not have parentEntity as child_1 entity'
    )

    const child3Entity = UUIDComponent.entitiesByUUID['child_3']
    assert(child3Entity, 'child_3 entity not found')
    assert.equal(
      hasComponent(child3Entity, EntityTreeComponent),
      true,
      'child_3 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child3Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_3 entity does not have parentEntity as child_2 entity'
    )

    const child4Entity = UUIDComponent.entitiesByUUID['child_4']
    assert(child4Entity, 'child_4 entity not found')
    assert.equal(
      hasComponent(child4Entity, EntityTreeComponent),
      true,
      'child_4 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child4Entity, EntityTreeComponent).parentEntity,
      child3Entity,
      'child_4 entity does not have parentEntity as child_3 entity'
    )

    const child5Entity = UUIDComponent.entitiesByUUID['child_5']
    assert(child5Entity, 'child_5 entity not found')
    assert.equal(
      hasComponent(child5Entity, EntityTreeComponent),
      true,
      'child_5 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child5Entity, EntityTreeComponent).parentEntity,
      child4Entity,
      'child_5 entity does not have parentEntity as child_4 entity'
    )

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity, 'child_2_1 entity not found')
    assert.equal(
      hasComponent(child2_1Entity, EntityTreeComponent),
      true,
      'child_2_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
      child2Entity,
      'child_2_1 entity does not have parentEntity as child_2 entity'
    )
    // check all entites are loaded correctly
    // check if data in the manual json matches scene data
    // unmount to cleanup

    const expectedSnapshot = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    expectedSnapshot.selectedEntities = [getComponent(child0Entity, UUIDComponent)] // forced change

    dispatchAction(SceneSnapshotAction.createSnapshot(expectedSnapshot))
    applyIncomingActions()

    const actualSnapShot = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    console.log(actualSnapShot, expectedSnapshot)
    assert.deepStrictEqual(actualSnapShot, expectedSnapshot, 'Snapshots do not match')

    unmountSceneLoader()
  })

  it('undo snapshot', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />
    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity, 'child_2_1 entity not found')
    assert.equal(
      hasComponent(child2_1Entity, EntityTreeComponent),
      true,
      'child_2_1 entity does not have EntityTreeComponent'
    )
    assert.equal(
      hasComponent(child2_1Entity, FogSettingsComponent),
      true,
      'child_2_1 entity does not have FogSettingsComponent'
    )
    const fog = getComponent(child2_1Entity, FogSettingsComponent)
    const originalfogData = testScene.scene.entities['child_2_1'].components.filter(
      (component) => component.name === 'fog'
    )[0]
    assert.deepStrictEqual(fog, originalfogData.props, 'fog component does not match')

    // unmount to cleanup
    unmount()
  })
  it('redo snapshot', async () => {
    // wont load unless we simulate the avatar and its distance from the dynamic entity
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)
    // its easier to just add the component to the scene and remove it at the end
    const dynamicLoadJson = {
      name: 'dynamic-load',
      props: {
        mode: 'distance',
        distance: 2,
        loaded: false
      }
    }

    testScene.scene.entities['child_0'].components.push(dynamicLoadJson)
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />

    // load scene

    // init
    SceneState.loadScene(testID, testScene)

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    // force re-render
    await act(() => rerender(tag))

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      null,
      'root entity does not have parentEntity'
    )

    const child0Entity = UUIDComponent.entitiesByUUID['child_0']
    assert(child0Entity, 'child_0 entity not found')
    assert.equal(
      hasComponent(child0Entity, EntityTreeComponent),
      true,
      'child_0 entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(child0Entity, EntityTreeComponent).parentEntity,
      rootEntity,
      'child_0 entity does not have parentEntity as root entity'
    )

    // check for failure to load
    const child1Entity = UUIDComponent.entitiesByUUID['child_1']
    assert.equal(child1Entity, undefined, 'child_1 entity found')
    testScene.scene.entities['child_0'].components = testScene.scene.entities['child_0'].components.filter(
      (component) => component.name !== 'dynamic-load'
    )

    unmount()
  })
  afterEach(() => {
    getMutableState(EngineState).isEditing.set(false)

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined
    return destroyEngine()
  })
})
