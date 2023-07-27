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

import { useEffect } from 'react'

import { config } from '@etherealengine/common/src/config'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { AvatarState } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { AuthState } from '../services/AuthService'

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = `${config.client.fileServer}/projects/default-project/assets/default-silhouette.svg`

export const useUserAvatarThumbnail = (userID = '' as UserId) => {
  const avatarState = useHookstate(DEFAULT_PROFILE_IMG_PLACEHOLDER)
  const localUserAvatarState = useHookstate(getState(AuthState).user.avatar)
  const userAvatarState = useHookstate(getMutableState(AvatarState)[userID as string as EntityUUID])

  useEffect(() => {
    if (!userAvatarState.avatarID?.value) return
    Engine.instance.api
      .service(avatarPath)
      .get(userAvatarState.avatarID.value)
      .then((avatarDetails) => {
        avatarState.set(avatarDetails.thumbnailResource?.url ?? DEFAULT_PROFILE_IMG_PLACEHOLDER)
      })
  }, [userAvatarState.avatarID])

  if (userID === Engine.instance.userId) {
    return localUserAvatarState.thumbnailResource.ornull?.url.value ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
  }

  return avatarState.value ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
}

/** @deprecated */
export const getUserAvatarThumbnail = (userID = '' as UserId) => {
  return getState(WorldState).userAvatarDetails[userID]?.thumbnailResource?.url ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
}
