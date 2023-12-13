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
import { destroyEngine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { SystemDefinitions } from '../../ecs/functions/SystemFunctions'
import { createEngine } from '../../initializeEngine'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { SceneDataType, SceneID, SceneJsonType } from '../../schemas/projects/scene.schema'
import { UUIDComponent } from '../components/UUIDComponent'
import { SceneLoadingSystem } from './SceneLoadingSystem'

const sceneJSON_1 = {
  scene: {
    entities: {
      root: {
        name: 'Root',
        components: []
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJsonType
} as SceneDataType

const sceneJSON_2 = {
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
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJsonType
} as SceneDataType

describe('SceneLoadingSystem', () => {
  beforeEach(() => {
    createEngine()
  })

  it('test reactor', async () => {
    getMutableState(PhysicsState).physicsWorld.set({} as any)

    // init
    const Reactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
    const tag = <Reactor />

    // render
    const { rerender, unmount } = render(tag)

    // load scene
    SceneState.loadScene('scene 1' as SceneID, sceneJSON_1)

    // force re-render
    await act(() => rerender(tag))

    // assertions
    assert.notEqual(UUIDComponent.entitiesByUUID['root'], undefined)

    // unmount to cleanup
    unmount()
  })

  afterEach(() => {
    return destroyEngine()
  })
})
