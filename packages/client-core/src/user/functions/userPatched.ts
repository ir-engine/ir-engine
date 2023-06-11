import { resolveUser } from '@etherealengine/common/src/interfaces/User'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { LocationInstanceConnectionAction } from '../../common/services/LocationInstanceConnectionService'
import { AuthAction, AuthState } from '../services/AuthService'

const logger = multiLogger.child({ component: 'client-core:userPatched' })

export const userPatched = (params) => {
  logger.info('USER PATCHED %o', params)

  const selfUser = getMutableState(AuthState).user
  const patchedUser = resolveUser(params || selfUser.get({ noproxy: true }))
  const worldHostID = getState(NetworkState).hostIds.world

  logger.info('Resolved patched user %o', patchedUser)

  const worldState = getMutableState(WorldState)
  worldState.userNames[patchedUser.id].set(patchedUser.name)

  if (selfUser.id.value === patchedUser.id) {
    dispatchAction(AuthAction.userUpdatedAction({ user: patchedUser }))
    // if (user.partyId) {
    //   setRelationship('party', user.partyId);
    // }
    const currentInstanceId = patchedUser.instanceAttendance?.find((attendance) => !attendance.isChannel)
      ?.instanceId as UserId
    if (worldHostID && currentInstanceId && worldHostID !== currentInstanceId) {
      dispatchAction(
        LocationInstanceConnectionAction.changeActiveConnectionHostId({
          currentInstanceId: worldHostID,
          newInstanceId: currentInstanceId
        })
      )
    }
  }
}
