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

import matches from 'ts-matches'

import { EntityUUID, matchesEntityUUID } from '@ir-engine/ecs'
import { defineAction, defineState, getMutableState, none } from '@ir-engine/hyperflux'
import { NetworkTopics, WorldNetworkAction } from '@ir-engine/network'

export class MountPointActions {
  static mountInteraction = defineAction({
    type: 'ee.engine.interactions.MOUNT' as const,
    mounted: matches.boolean,
    targetMount: matchesEntityUUID,
    mountedEntity: matchesEntityUUID,
    $topic: NetworkTopics.world
  })
}

export const MountPointState = defineState({
  name: 'MountPointState',
  initial: () => ({
    mountsToMountedEntities: {} as Record<EntityUUID, EntityUUID>,
    mountedEntitiesToMounts: {} as Record<EntityUUID, EntityUUID>
  }),

  receptors: {
    onMountInteraction: MountPointActions.mountInteraction.receive((action) => {
      const state = getMutableState(MountPointState)
      if (action.mounted) {
        addEntry(action.targetMount, action.mountedEntity)
      } else {
        removeEntry(action.targetMount, action.mountedEntity)
      }
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      onEntityDestroyed(action.entityUUID)
    })
  }
})

const addEntry = (targetMount: EntityUUID, mountedEntity: EntityUUID) => {
  const state = getMutableState(MountPointState)
  state.mountsToMountedEntities[targetMount].set(mountedEntity)
  state.mountedEntitiesToMounts[mountedEntity].set(targetMount)
}

const removeEntry = (targetMount: EntityUUID, mountedEntity: EntityUUID) => {
  const state = getMutableState(MountPointState)
  state.mountsToMountedEntities[targetMount].set(none)
  state.mountedEntitiesToMounts[mountedEntity].set(none)
}

const onEntityDestroyed = (entityUUID: EntityUUID) => {
  const state = getMutableState(MountPointState)
  if (entityUUID in state.mountedEntitiesToMounts.value) {
    const mountUUID = state.mountedEntitiesToMounts[entityUUID].value
    if (mountUUID) {
      removeEntry(mountUUID, entityUUID)
    }
  }
}
