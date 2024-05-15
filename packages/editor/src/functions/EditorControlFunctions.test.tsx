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

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { UUIDComponent, getComponent } from '@etherealengine/ecs'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { EntityUUID } from '@etherealengine/ecs/src/Entity'
import { GLTFSnapshotState, GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { applyIncomingActions, getMutableState, getState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Cache, MathUtils } from 'three'
import { EditorState } from '../services/EditorServices'
import { EditorControlFunctions } from './EditorControlFunctions'

const timeout = globalThis.setTimeout

describe('EditorControlFunctions2', () => {
  beforeEach(async () => {
    createEngine()
    getMutableState(PhysicsState).physicsWorld.set({} as any)
    getMutableState(EngineState).isEditing.set(true)
    getMutableState(EngineState).isEditor.set(true)
    Engine.instance.userID = 'user' as UserID
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    // patch setTimeout to run the callback immediately
    // @ts-ignore
    globalThis.setTimeout = (fn) => fn()
  })

  afterEach(() => {
    globalThis.setTimeout = timeout
    return destroyEngine()
  })

  describe('addOrRemoveComponent', () => {
    it('should add and remove component from root child', () => {
      const nodeUUID = MathUtils.generateUUID() as EntityUUID

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
      const rootEntity = GLTFSourceState.load('/test.gltf')
      getMutableState(EditorState).rootEntity.set(rootEntity)
      applyIncomingActions()

      const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)
      const sourceID = getComponent(nodeEntity, SourceComponent)

      EditorControlFunctions.addOrRemoveComponent([nodeEntity], VisibleComponent, true)

      applyIncomingActions()

      const newSnapshot = getState(GLTFSnapshotState)[sourceID].snapshots[1]
      assert(newSnapshot.nodes![0].extensions![VisibleComponent.jsonID])

      EditorControlFunctions.addOrRemoveComponent([nodeEntity], VisibleComponent, false)

      applyIncomingActions()

      const newSnapshot2 = getState(GLTFSnapshotState)[sourceID].snapshots[2]
      assert(!newSnapshot2.nodes![0].extensions![VisibleComponent.jsonID])
    })

    it('should add and remove component from root child', () => {
      const nodeUUID = MathUtils.generateUUID() as EntityUUID
      const childUUID = MathUtils.generateUUID() as EntityUUID

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
      const rootEntity = GLTFSourceState.load('/test.gltf')
      getMutableState(EditorState).rootEntity.set(rootEntity)
      applyIncomingActions()

      const childEntity = UUIDComponent.getEntityByUUID(childUUID)
      const sourceID = getComponent(childEntity, SourceComponent)

      EditorControlFunctions.addOrRemoveComponent([childEntity], VisibleComponent, true)

      applyIncomingActions()

      const newSnapshot = getState(GLTFSnapshotState)[sourceID].snapshots[1]
      assert(newSnapshot.nodes![1].extensions![VisibleComponent.jsonID])

      EditorControlFunctions.addOrRemoveComponent([childEntity], VisibleComponent, false)

      applyIncomingActions()

      const newSnapshot2 = getState(GLTFSnapshotState)[sourceID].snapshots[2]
      assert(!newSnapshot2.nodes![1].extensions![VisibleComponent.jsonID])
    })
  })
})
