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

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { applyIncomingActions, getMutableState } from '@etherealengine/hyperflux'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Cache, MathUtils } from 'three'
import { GLTFSourceState } from './GLTFState'

describe('GLTFState', () => {
  beforeEach(async () => {
    createEngine()

    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should load a GLTF file with a single node', () => {
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
            [UUIDComponent.jsonID!]: nodeUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const timeout = globalThis.setTimeout
    // patch setTimeout to run the callback immediately
    // @ts-ignore
    globalThis.setTimeout = (fn) => fn()

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    globalThis.setTimeout = timeout

    applyIncomingActions()

    assert(UUIDComponent.getEntityByUUID(nodeUUID))

    GLTFSourceState.unload(gltfEntity)

    applyIncomingActions()

    assert(!UUIDComponent.getEntityByUUID(nodeUUID))
  })
})
