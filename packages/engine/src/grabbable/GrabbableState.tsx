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

import React, { useEffect } from 'react'

import {
  entityExists,
  EntityUUID,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  HyperFlux,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { EntityNetworkState, SceneUser, WorldNetworkAction } from '@ir-engine/network'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'

import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { getChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import '@ir-engine/spatial/src/transform/SpawnPoseState'
import { GrabbableNetworkAction, GrabbedComponent, GrabberComponent } from './GrabbableComponent'

export const GrabbableState = defineState({
  name: 'ee.engine.grabbables.GrabbableState',

  initial: {} as Record<
    EntityUUID,
    {
      attachmentPoint: 'left' | 'right'
      grabberEntityUUID: EntityUUID
    }
  >,

  receptors: {
    onSetGrabbedObject: GrabbableNetworkAction.setGrabbedObject.receive((action) => {
      const state = getMutableState(GrabbableState)
      if (action.grabbed)
        state[action.entityUUID].set({
          attachmentPoint: action.attachmentPoint ?? 'right',
          grabberEntityUUID: action.grabberEntityUUID
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
  const grabberEntity = UUIDComponent.useEntityByUUID(state.grabberEntityUUID.value as EntityUUID)

  const attachmentPoint = state.attachmentPoint.value

  const entityNetworkState = useMutableState(EntityNetworkState).value

  const ownedByScene = entityNetworkState[entityUUID]?.ownerId === SceneUser
  const grabbableAuthorityPeer = entityNetworkState[entityUUID]?.authorityPeerId
  const grabberAuthorityPeer = entityNetworkState[state.grabberEntityUUID.value]?.authorityPeerId

  const hasAuthority = grabbableAuthorityPeer === grabberAuthorityPeer

  useEffect(() => {
    if (!entity || !grabberEntity || !hasAuthority) return

    setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: entity })
    setComponent(entity, GrabbedComponent, {
      grabberEntity,
      attachmentPoint
    })

    if (hasComponent(entity, RigidBodyComponent)) {
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      Physics.wakeUp(Physics.getWorld(entity)!, entity)

      const colliders = [entity, ...getChildrenWithComponents(entity, [ColliderComponent])]

      for (const collider of colliders) {
        if (!hasComponent(collider, ColliderComponent)) continue
        getMutableComponent(collider, ColliderComponent).collisionMask.set((mask) => (mask ^= CollisionGroups.Avatars))
      }
    }

    return () => {
      setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: null })
      if (!entityExists(entity)) return
      removeComponent(entity, GrabbedComponent)
      if (hasComponent(entity, RigidBodyComponent)) {
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.wakeUp(Physics.getWorld(entity)!, entity)

        const colliders = [entity, ...getChildrenWithComponents(entity, [ColliderComponent])]

        for (const collider of colliders) {
          if (!hasComponent(collider, ColliderComponent)) continue
          getMutableComponent(collider, ColliderComponent).collisionMask.set(
            (mask) => (mask ^= CollisionGroups.Avatars)
          )
        }
      }
    }
  }, [entity, grabberEntity, hasAuthority])

  const needsToRequestAuthority =
    entity !== UndefinedEntity &&
    grabberEntity !== UndefinedEntity &&
    (ownedByScene || grabbableAuthorityPeer !== grabberAuthorityPeer) &&
    grabberAuthorityPeer === HyperFlux.store.peerID

  useEffect(() => {
    if (!needsToRequestAuthority) return
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID,
        newAuthority: HyperFlux.store.peerID,
        $to: ownedByScene ? HyperFlux.store.peerID : grabbableAuthorityPeer
      })
    )
  }, [needsToRequestAuthority])

  return null
}
