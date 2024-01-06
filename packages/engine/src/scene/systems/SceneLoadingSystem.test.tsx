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
import { SceneDataType, SceneID, SceneJsonType, UserID } from '@etherealengine/common/src/schema.type.module'
import { applyIncomingActions, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { act, render, waitFor } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { EditorControlFunctions } from '../../../../editor/src/functions/EditorControlFunctions'
import testSceneJson from '../../../tests/assets/SceneLoadingTest.scene.json'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { EventDispatcher } from '../../common/classes/EventDispatcher'
import { Engine, destroyEngine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { UndefinedEntity } from '../../ecs/classes/Entity'
import { SceneSnapshotAction, SceneSnapshotSystem, SceneState } from '../../ecs/classes/Scene'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { SystemDefinitions } from '../../ecs/functions/SystemFunctions'
import { createEngine } from '../../initializeEngine'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { FogSettingsComponent } from '../components/FogSettingsComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { SceneLoadingSystem } from './SceneLoadingSystem'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
const modelLink = '/packages/projects/default-project/assets/collisioncube.glb'
const testScene = {
  name: '',
  thumbnailUrl: '',
  project: '',
  scenePath: 'test' as SceneID,
  scene: testSceneJson as unknown as SceneJsonType
} as SceneDataType

const testID = 'test' as SceneID
overrideFileLoaderLoad()
describe('SceneLoadingSystem', () => {
  beforeEach(async () => {
    createEngine()
    Engine.instance.userID = 'user' as UserID
    Engine.instance.store.defaultDispatchDelay = () => 0
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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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

    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
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

    const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
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

    const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
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

    const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
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

    const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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
    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
    console.log('DEBUG', child1Entity)
    assert.equal(child1Entity, UndefinedEntity, 'child_1 entity found')
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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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

    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
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

    const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
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

    const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
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

    const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
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

    const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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
    testScene.scene.entities['child_0'].components = testScene.scene.entities['child_0'].components.filter(
      (component) => component.name !== 'dynamic-load'
    )
    unmount()
  })
  it('will load sub-scene from model component', async () => {
    getMutableState(SceneState).activeScene.set(testID)
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init
    const LoadReactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const loadTag = <LoadReactor />

    SceneState.loadScene(testID, testScene)

    // render
    const { rerender: loadScene, unmount: unmountSceneLoader } = render(loadTag)

    // load scene
    // force re-render
    await act(() => loadScene(loadTag))

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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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
    // will capture the sceneAssetPendingTag for the model component
    const model = getComponent(child0Entity, ModelComponent)
    assert.equal(model.src, modelLink, 'model link is different')

    await waitFor(
      () => {
        assert(model.scene !== null, `model scene not found ${model.scene}`)
      },
      { timeout: 1500, interval: 499 }
    )

    assert(model.scene !== null, 'model scene not found')
    const children = getComponent(child0Entity, EntityTreeComponent).children
    assert(children.length > 2)

    const BoxEntity = children[2]
    const colliderEntity = children[1]

    assert(BoxEntity, 'root entity not found')
    assert.equal(hasComponent(BoxEntity, EntityTreeComponent), true, 'Box entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(BoxEntity, EntityTreeComponent).parentEntity,
      child0Entity,
      'Box entity does not have parentEntity'
    )
    assert.equal(getComponent(BoxEntity, NameComponent), 'Box', 'Box entity name is incorrect')

    assert(colliderEntity, 'root entity not found')
    assert.equal(
      hasComponent(colliderEntity, EntityTreeComponent),
      true,
      'collider entity does not have EntityTreeComponent'
    )
    assert.equal(
      getComponent(colliderEntity, EntityTreeComponent).parentEntity,
      child0Entity,
      'collider entity does not have parentEntity'
    )
    assert.equal(getComponent(colliderEntity, NameComponent), 'Collider', 'Collider entity name is incorrect')

    unmountSceneLoader()
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
    // will capture the sceneAssetPendingTag for the model component
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
      if (hasComponent(entity, ModelComponent)) {
        assert.equal(
          hasComponent(entity, SceneAssetPendingTagComponent),
          true,
          'entity with model does not have SceneAssetPendingTagComponent'
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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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

    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
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

    const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
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

    const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
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

    const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
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

    const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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
    getMutableState(EngineState).isEditor.set(true)
    Engine.instance.store.defaultDispatchDelay = () => 0

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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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

    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
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

    const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
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

    const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
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

    const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
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

    const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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
    const visibleJson = {
      name: 'visible',
      props: {}
    }
    const root = expectedSnapshot.data.entities['root']
    root.components.push(visibleJson)

    expectedSnapshot.data.entities['root'] = root

    dispatchAction(SceneSnapshotAction.createSnapshot(expectedSnapshot))

    applyIncomingActions()

    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    const actualSnapShot = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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

    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
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

    const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
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

    const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
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

    const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
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

    const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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
    const oldSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    EditorControlFunctions.removeObject([child2_1Entity])
    applyIncomingActions()
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()
    await act(() => rerender(tag)) // reload scene after snapshot

    assert.equal(
      UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID),
      UndefinedEntity,
      'snapshot unchanged,  entity was not deleted'
    )

    dispatchAction(SceneSnapshotAction.undo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    applyIncomingActions()
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    // wait again
    const undoSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    assert.deepStrictEqual(oldSnap, undoSnap, 'Snapshots do not match')
    // unmount to cleanup
    unmount()
  })

  it('redo snapshot', async () => {
    // wont load unless we simulate the avatar and its distance from the dynamic entity
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

    const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
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

    const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
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

    const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
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

    const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
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

    const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
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

    const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
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

    const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
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

    const oldSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    EditorControlFunctions.removeObject([child2_1Entity])
    applyIncomingActions()
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()
    await act(() => rerender(tag)) // reload scene after snapshot

    // wait somehow
    const newSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    assert.equal(
      UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID),
      UndefinedEntity,
      'snapshot unchanged entity not deleted'
    )

    dispatchAction(SceneSnapshotAction.undo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    applyIncomingActions()
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    // wait again
    const undoSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    assert.deepStrictEqual(oldSnap, undoSnap, 'undo Snapshots do not match')

    dispatchAction(SceneSnapshotAction.redo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    applyIncomingActions()
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    const redoSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    assert.deepStrictEqual(newSnap, redoSnap, 'redo Snapshots do not match')

    // unmount to cleanup
    unmount()
  })
  afterEach(() => {
    getMutableState(EngineState).isEditing.set(false)
    getMutableState(EngineState).isEditor.set(false)

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined
    return destroyEngine()
  })
})
