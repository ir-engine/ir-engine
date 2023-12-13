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

import { getMutableState } from '@etherealengine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { EventDispatcher } from '../../common/classes/EventDispatcher'
import { Engine, destroyEngine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { SystemDefinitions } from '../../ecs/functions/SystemFunctions'
import { createEngine } from '../../initializeEngine'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { SceneDataType, SceneID, SceneJsonType } from '../../schemas/projects/scene.schema'
import { FogSettingsComponent } from '../components/FogSettingsComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { SceneLoadingSystem } from './SceneLoadingSystem'

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
        components: [],
        parent: 'root'
      },
      child_1: {
        name: 'Child 1',
        components: [],
        parent: 'child_0'
      },
      child_2: {
        name: 'Child 2',
        components: [],
        parent: 'child_1'
      },
      child_3: {
        name: 'Child 3',
        components: [],
        parent: 'child_2'
      },
      child_4: {
        name: 'Child 4',
        components: [],
        parent: 'child_3'
      },
      child_5: {
        name: 'Child 5',
        components: [],
        parent: 'child_4'
      },
      child_2_1: {
        name: 'Child 2 _ 1',
        components: [
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

    // unmount to cleanup
    unmount()
  })

  it('will load entities data', async () => {
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
    assert(rootEntity)
    assert.equal(hasComponent(rootEntity, EntityTreeComponent), true)
    assert.equal(getComponent(rootEntity, EntityTreeComponent).parentEntity, null)

    const child2_1Entity = UUIDComponent.entitiesByUUID['child_2_1']
    assert(child2_1Entity)
    assert.equal(hasComponent(child2_1Entity, EntityTreeComponent), true)
    assert.equal(hasComponent(child2_1Entity, FogSettingsComponent), true)
    const fog = getComponent(child2_1Entity, FogSettingsComponent)
    assert.deepStrictEqual(fog, testScene.scene.entities['child_2_1'].components[0].props)

    // unmount to cleanup
    unmount()
  })
  it('will not load dynamic entity', async () => {
    // set to location mode
    // load scene
    // create dynamic entity
    // load dynamic entity
    // check for failure to load
  })
  it('will load dynamic entity', async () => {
    // set to studio mode
    // load scene
    // create dynamic entity
    // load dynamic entity
    // check for success to load
  })
  it('will load sub-scene', async () => {
    // load scene with model component
    // check for success of model component
    // check for model component children
  })
  it('test reactor', async () => {
    // init
  })
  afterEach(() => {
    return destroyEngine()
  })
})
