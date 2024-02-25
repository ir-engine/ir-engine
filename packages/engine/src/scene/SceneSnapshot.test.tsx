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
import { getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { SystemDefinitions } from '@etherealengine/ecs/src/SystemFunctions'
import {
  SceneActions,
  SceneSnapshotAction,
  SceneSnapshotSystem,
  SceneState
} from '@etherealengine/engine/src/scene/Scene'
import {
  ReactorReconciler,
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState
} from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { EventDispatcher } from '@etherealengine/spatial/src/common/classes/EventDispatcher'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import assert from 'assert'

import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { EditorControlFunctions } from '../../../editor/src/functions/EditorControlFunctions'
import testSceneJson from '../../tests/assets/SceneLoadingTest.scene.json'

const testScene = {
  name: '',
  thumbnailUrl: '',
  project: '',
  scenePath: 'test' as SceneID,
  scene: testSceneJson as unknown as SceneJsonType
} as SceneDataType

const testID = 'test' as SceneID

describe('Snapshots', () => {
  beforeEach(async () => {
    createEngine()
    getMutableState(EngineState).isEditing.set(true)
    getMutableState(EngineState).isEditor.set(true)
    Engine.instance.store.defaultDispatchDelay = () => 0

    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())

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

  afterEach(() => {
    getMutableState(EngineState).isEditing.set(false)
    getMutableState(EngineState).isEditor.set(false)
    return destroyEngine()
  })

  it('create snapshot', async () => {
    getMutableState(SceneState).activeScene.set(testID)

    // init
    dispatchAction(SceneActions.loadScene({ sceneID: testID, sceneData: testScene }))
    ReactorReconciler.flushSync(() => applyIncomingActions())

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      UndefinedEntity,
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

    const expectedSnapshot = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    const visibleJson = {
      name: 'visible',
      props: {}
    }
    const root = expectedSnapshot.data.entities['root']
    root.components.push(visibleJson)

    expectedSnapshot.data.entities['root'] = root

    dispatchAction(SceneSnapshotAction.createSnapshot(expectedSnapshot))

    ReactorReconciler.flushSync(() => applyIncomingActions())

    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    const actualSnapShot = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    assert.deepStrictEqual(actualSnapShot, expectedSnapshot, 'Snapshots do not match')
  })

  it('undo snapshot', async () => {
    getMutableState(SceneState).activeScene.set(testID)

    // init
    dispatchAction(SceneActions.loadScene({ sceneID: testID, sceneData: testScene }))
    ReactorReconciler.flushSync(() => applyIncomingActions())

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      UndefinedEntity,
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

    ReactorReconciler.flushSync(() => applyIncomingActions())
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    assert.equal(
      UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID),
      UndefinedEntity,
      'snapshot unchanged,  entity was not deleted'
    )

    dispatchAction(SceneSnapshotAction.undo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    ReactorReconciler.flushSync(() => applyIncomingActions())
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    // wait again
    const undoSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    assert.deepStrictEqual(oldSnap, undoSnap, 'Snapshots do not match')
  })

  it('redo snapshot', async () => {
    // wont load unless we simulate the avatar and its distance from the dynamic entity
    getMutableState(SceneState).activeScene.set(testID)

    // init
    dispatchAction(SceneActions.loadScene({ sceneID: testID, sceneData: testScene }))
    ReactorReconciler.flushSync(() => applyIncomingActions())

    // assertions
    const rootEntity = SceneState.getRootEntity(testID)
    assert(rootEntity, 'root entity not found')
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true, 'root entity does not have EntityTreeComponent')
    assert.equal(
      getComponent(rootEntity, EntityTreeComponent).parentEntity,
      UndefinedEntity,
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
    ReactorReconciler.flushSync(() => applyIncomingActions())
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    // wait somehow
    const newSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    assert.equal(
      UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID),
      UndefinedEntity,
      'snapshot unchanged entity not deleted'
    )

    dispatchAction(SceneSnapshotAction.undo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    ReactorReconciler.flushSync(() => applyIncomingActions())
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    // wait again
    const undoSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)
    assert.deepStrictEqual(oldSnap, undoSnap, 'undo Snapshots do not match')

    dispatchAction(SceneSnapshotAction.redo({ count: 1, sceneID: getState(SceneState).activeScene! }))
    ReactorReconciler.flushSync(() => applyIncomingActions())
    SystemDefinitions.get(SceneSnapshotSystem)!.execute()

    const redoSnap = SceneState.cloneCurrentSnapshot(getState(SceneState).activeScene!)

    assert.deepStrictEqual(newSnap, redoSnap, 'redo Snapshots do not match')
  })
})
