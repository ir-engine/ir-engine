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

import React, { useEffect } from 'react'

import {
  defineQuery,
  defineSystem,
  Engine,
  entityExists,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  SimulationSystemGroup,
  UUIDComponent
} from '@etherealengine/ecs'
import {
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@etherealengine/hyperflux'
import { NetworkObjectAuthorityTag, NetworkState, WorldNetworkAction } from '@etherealengine/network'
import { ClientInputSystem } from '@etherealengine/spatial'
import { Vector3_Zero } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { GrabbableComponent, GrabbedComponent, GrabberComponent, onDrop } from '../components/GrabbableComponent'
import { GrabbableNetworkAction } from '../functions/grabbableFunctions'

export const GrabbableState = defineState({
  name: 'ee.engine.grabbables.GrabbableState',

  initial: {} as Record<
    EntityUUID,
    {
      attachmentPoint: 'left' | 'right'
      grabberUserId: EntityUUID
    }
  >,

  receptors: {
    onSetGrabbedObject: GrabbableNetworkAction.setGrabbedObject.receive((action) => {
      const state = getMutableState(GrabbableState)
      if (action.grabbed)
        state[action.entityUUID].set({
          attachmentPoint: action.attachmentPoint ?? 'right',
          grabberUserId: action.grabberUserId
        })
      else state[action.entityUUID].set(none)
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      const state = getMutableState(GrabbableState)
      state[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const grabbableState = useMutableState(GrabbableState)
    return (
      <>
        {grabbableState.keys.map((entityUUID: EntityUUID) => (
          <GrabbableReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const GrabbableReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(GrabbableState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)
  const grabberEntity = UUIDComponent.useEntityByUUID(state.grabberUserId.value as EntityUUID)
  const attachmentPoint = state.attachmentPoint.value

  useEffect(() => {
    if (!entity || !grabberEntity) return

    setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: entity })
    setComponent(entity, GrabbedComponent, {
      grabberEntity,
      attachmentPoint
    })

    if (hasComponent(entity, RigidBodyComponent)) {
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      // for (let i = 0; i < body.numColliders(); i++) {
      //   const collider = body.collider(i)
      //   let oldCollisionGroups = collider.collisionGroups()
      //   oldCollisionGroups ^= CollisionGroups.Default << 16
      //   collider.setCollisionGroups(oldCollisionGroups)
      // }
    }

    return () => {
      if (hasComponent(grabberEntity, GrabbedComponent))
        setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: null })
      if (!entityExists(entity)) return
      removeComponent(entity, GrabbedComponent)
      if (hasComponent(entity, RigidBodyComponent)) {
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        // for (let i = 0; i < body.numColliders(); i++) {
        //   const collider = body.collider(i)
        //   let oldCollisionGroups = collider.collisionGroups()
        //   oldCollisionGroups ^= CollisionGroups.Default << 16
        //   collider.setCollisionGroups(oldCollisionGroups)
        // }
      }
    }
  }, [entity, grabberEntity])

  return null
}

/** @deprecated @todo - replace with reactor */
export function transferAuthorityOfObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>
) {
  if (action.newAuthority !== Engine.instance.store.peerID) return
  const grabbableEntity = UUIDComponent.getEntityByUUID(action.entityUUID)
  if (hasComponent(grabbableEntity, GrabbableComponent)) {
    const grabberUserId = NetworkState.worldNetwork.peers[action.newAuthority]?.userId
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbableEntity, UUIDComponent),
        grabberUserId: grabberUserId as any as EntityUUID,
        grabbed: !hasComponent(grabbableEntity, GrabbedComponent),
        // todo, pass attachment point through actions somehow
        attachmentPoint: 'right'
      })
    )
  }
}

/**
 * @todo refactor this into i18n and configurable
 */

/** @todo replace this with event sourcing */
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
const ownedGrabbableQuery = defineQuery([GrabbableComponent, NetworkObjectAuthorityTag])

const execute = () => {
  if (getState(EngineState).isEditing) return

  for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

  for (const entity of ownedGrabbableQuery()) {
    const grabbedComponent = getOptionalComponent(entity, GrabbedComponent)
    if (!grabbedComponent) return
    const attachmentPoint = grabbedComponent.attachmentPoint

    const target = getHandTarget(grabbedComponent.grabberEntity, attachmentPoint ?? 'right')!

    const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)

    if (rigidbodyComponent) {
      rigidbodyComponent.targetKinematicPosition.copy(target.position)
      rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
      Physics.setRigidbodyPose(entity, target.position, target.rotation, Vector3_Zero, Vector3_Zero)
    }

    const grabbableTransform = getComponent(entity, TransformComponent)
    grabbableTransform.position.copy(target.position)
    grabbableTransform.rotation.copy(target.rotation)
  }
}

const executeInput = () => {
  const inputSources = InputSourceComponent.nonCapturedInputSources()
  const buttons = InputComponent.getMergedButtonsForInputSources(inputSources)
  if (buttons.KeyU?.down) onDrop()
}

export const GrabbableSystem = defineSystem({
  uuid: 'ee.engine.GrabbableSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

export const GrabbableInputSystem = defineSystem({
  uuid: 'ee.engine.GrabbableInputSystem',
  insert: { after: ClientInputSystem },
  execute: executeInput
})
