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

import { Entity, UndefinedEntity, createEntity, destroyEngine, setComponent } from '@etherealengine/ecs'
import { getMutableState } from '@etherealengine/hyperflux'

import { NodeID, NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import assert from 'assert'
import { TransformComponent } from '../../SpatialModule'
import { setCallback } from '../../common/CallbackComponent'
import { createEngine } from '../../initializeEngine'
import { SourceComponent, SourceID } from '../../transform/components/SourceComponent'
import { Physics } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { TriggerComponent } from '../components/TriggerComponent'
import { PhysicsState } from '../state/PhysicsState'
import { triggerEnter } from './TriggerSystem'

describe('TriggerSystem', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should handle triggerEnter events', () => {
    const targetEntity = createEntity()

    let entered = false

    setComponent(targetEntity, TransformComponent)
    setComponent(targetEntity, RigidBodyComponent, { type: 'dynamic' })
    setComponent(targetEntity, ColliderComponent)
    setComponent(targetEntity, SourceComponent, 'target-source' as SourceID)
    setComponent(targetEntity, NodeIDComponent, 'target-node' as NodeID)
    setCallback(targetEntity, 'trigger', (triggerEntity: Entity, otherEntity: Entity) => {
      entered = true
    })

    const triggerEntity = createEntity()

    setComponent(triggerEntity, TransformComponent)

    setComponent(triggerEntity, SourceComponent, 'target-source' as SourceID)
    setComponent(triggerEntity, RigidBodyComponent, { type: 'fixed' })
    setComponent(triggerEntity, TriggerComponent, {
      triggers: [
        {
          onEnter: 'trigger',
          onExit: null,
          target: 'target-node' as NodeID
        }
      ]
    })
    setComponent(triggerEntity, ColliderComponent)

    triggerEnter(triggerEntity, UndefinedEntity)

    assert.equal(entered, true)
  })

  it('should not handle triggerEnter events in another source', () => {
    const targetEntity = createEntity()

    let entered = false

    setComponent(targetEntity, TransformComponent)
    setComponent(targetEntity, RigidBodyComponent, { type: 'dynamic' })
    setComponent(targetEntity, ColliderComponent)
    setComponent(targetEntity, SourceComponent, 'target-source' as SourceID)
    setComponent(targetEntity, NodeIDComponent, 'target-node' as NodeID)
    setCallback(targetEntity, 'trigger', (triggerEntity: Entity, otherEntity: Entity) => {
      entered = true
    })

    const triggerEntity = createEntity()

    setComponent(triggerEntity, TransformComponent)

    setComponent(triggerEntity, SourceComponent, 'another-source' as SourceID)
    setComponent(triggerEntity, RigidBodyComponent, { type: 'fixed' })
    setComponent(triggerEntity, TriggerComponent, {
      triggers: [
        {
          onEnter: 'trigger',
          onExit: null,
          target: 'target-node' as NodeID
        }
      ]
    })
    setComponent(triggerEntity, ColliderComponent)

    triggerEnter(triggerEntity, UndefinedEntity)

    assert.equal(entered, false)
  })
})
