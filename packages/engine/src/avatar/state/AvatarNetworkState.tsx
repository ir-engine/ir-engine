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

import React, { useEffect, useLayoutEffect } from 'react'

import {
  EntityUUID,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { entityExists } from '@ir-engine/ecs/src/EntityFunctions'
import { AvatarColliderComponent } from '@ir-engine/engine/src/avatar/components/AvatarControllerComponent'
import { spawnAvatarReceptor } from '@ir-engine/engine/src/avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { defineState, getMutableState, isClient, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { WorldNetworkAction } from '@ir-engine/network'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { GLTFComponent } from '../../gltf/GLTFComponent'

export const AvatarState = defineState({
  name: 'ee.engine.avatar.AvatarState',

  initial: {} as Record<
    EntityUUID,
    {
      avatarURL: string
      name: string
    }
  >,

  receptors: {
    onSpawn: AvatarNetworkAction.spawn.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].set({ avatarURL: action.avatarURL, name: action.name })
    }),
    onSetAvatarID: AvatarNetworkAction.setAvatarURL.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].merge({ avatarURL: action.avatarURL })
    }),
    onSetAvatarName: AvatarNetworkAction.setName.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].merge({ name: action.name })
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(AvatarState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const avatarState = useMutableState(AvatarState)
    return (
      <>
        {avatarState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const { avatarURL, name } = useHookstate(getMutableState(AvatarState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)
  const hasTransformComponent = useOptionalComponent(entity, TransformComponent)

  useLayoutEffect(() => {
    if (!entity || !hasTransformComponent) return
    spawnAvatarReceptor(entityUUID)
  }, [entity, hasTransformComponent])

  useEffect(() => {
    if (!isClient) return
    if (!entity || !avatarURL.value) return

    setComponent(entity, GLTFComponent, { src: avatarURL.value })

    return () => {
      if (!entityExists(entity)) return
      removeComponent(entity, GLTFComponent)
    }
  }, [avatarURL.value, entity])

  useEffect(() => {
    if (!entity) return
    setComponent(entity, NameComponent, name.value + "'s avatar")
    const colliderEntity = getOptionalComponent(entity, AvatarColliderComponent)?.colliderEntity
    if (colliderEntity) {
      setComponent(colliderEntity, NameComponent, name.value + "'s collider")
    }
  }, [name, entity])

  return null
}
