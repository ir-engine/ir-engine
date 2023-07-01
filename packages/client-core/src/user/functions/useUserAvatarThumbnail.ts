import { useEffect } from 'react'

import { config } from '@etherealengine/common/src/config'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { AvatarState } from '@etherealengine/engine/src/avatar/AvatarSystemGroups'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = `${config.client.fileServer}/projects/default-project/assets/default-silhouette.svg`

export const useUserAvatarThumbnail = (userID = '' as UserId) => {
  const avatarState = useHookstate(DEFAULT_PROFILE_IMG_PLACEHOLDER)
  const userAvatarState = useHookstate(getMutableState(AvatarState)[userID as string as EntityUUID])

  useEffect(() => {
    if (!userAvatarState.avatarID.value) return
    Engine.instance.api
      .service('avatar')
      .get(userAvatarState.avatarID.value)
      .then((avatarDetails) => {
        avatarState.set(avatarDetails.thumbnailResource?.url ?? DEFAULT_PROFILE_IMG_PLACEHOLDER)
      })
  }, [userAvatarState.avatarID])

  return avatarState.value ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
}

/** @deprecated */
export const getUserAvatarThumbnail = (userID = '' as UserId) => {
  return getState(WorldState).userAvatarDetails[userID]?.thumbnailResource?.url ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
}
