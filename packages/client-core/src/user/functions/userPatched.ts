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

import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { LocationInstanceConnectionService } from '../../common/services/LocationInstanceConnectionService'
import { AuthState } from '../services/AuthService'

const logger = multiLogger.child({ component: 'client-core:userPatched' })

export const userPatched = (user: UserType) => {
  logger.info('USER PATCHED %o', user)

  const selfUser = getMutableState(AuthState).user
  const patchedUser = user || selfUser.get({ noproxy: true })
  const worldHostID = getState(NetworkState).hostIds.world

  logger.info('Resolved patched user %o', patchedUser)

  const worldState = getMutableState(WorldState)
  worldState.userNames[patchedUser.id].set(patchedUser.name)

  if (selfUser.id.value === patchedUser.id) {
    getMutableState(AuthState).merge({ user: patchedUser })
    const currentInstanceId = patchedUser.instanceAttendance?.find((attendance) => !attendance.isChannel)
      ?.instanceId as InstanceID
    if (worldHostID && currentInstanceId && worldHostID !== currentInstanceId) {
      LocationInstanceConnectionService.changeActiveConnectionID(worldHostID, currentInstanceId)
    }
  }
}
