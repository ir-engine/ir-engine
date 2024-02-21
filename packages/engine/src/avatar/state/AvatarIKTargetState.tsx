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

import { defineState, getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { WorldNetworkAction } from '@etherealengine/spatial/src/networking/functions/WorldNetworkAction'
import React, { useLayoutEffect } from 'react'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

export const AvatarIKTargetState = defineState({
  name: 'ee.engine.avatar.AvatarIKTargetState',

  initial: {} as Record<
    EntityUUID,
    {
      name: string
    }
  >,

  receptors: {
    onSpawn: AvatarNetworkAction.spawnIKTarget.receive((action) => {
      getMutableState(AvatarIKTargetState)[action.entityUUID].merge({ name: action.name })
    }),
    onDestroyObject: WorldNetworkAction.destroyObject.receive((action) => {
      getMutableState(AvatarIKTargetState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const avatarIKTargetState = useHookstate(getMutableState(AvatarIKTargetState))
    return (
      <>
        {avatarIKTargetState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(AvatarIKTargetState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  useLayoutEffect(() => {
    if (!entity) return
    setComponent(entity, NameComponent, state.name.value)
    setComponent(entity, AvatarIKTargetComponent)
  }, [entity])

  return null
}
