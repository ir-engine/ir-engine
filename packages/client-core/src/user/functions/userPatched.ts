import { t } from 'i18next'

import { resolveUser } from '@etherealengine/common/src/interfaces/User'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { LocationInstanceConnectionAction } from '../../common/services/LocationInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState, AuthAction } from '../services/AuthService'
import { accessNetworkUserState, NetworkUserAction } from '../services/NetworkUserService'

const logger = multiLogger.child({ component: 'client-core:userPatched' })

export const userPatched = (params) => {
  logger.info('USER PATCHED %o', params)

  const selfUser = accessAuthState().user
  const userState = accessNetworkUserState()
  const patchedUser = resolveUser(params.userRelationship || selfUser)
  const worldHostID = getState(NetworkState).hostIds.world

  logger.info('Resolved patched user %o', patchedUser)

  const worldState = getMutableState(WorldState)
  worldState.userNames[patchedUser.id].set(patchedUser.name)

  if (selfUser.id.value === patchedUser.id) {
    if (selfUser.instanceId.value !== patchedUser.instanceId)
      dispatchAction(NetworkUserAction.clearLayerUsersAction({}))
    if (selfUser.channelInstanceId.value !== patchedUser.channelInstanceId)
      dispatchAction(NetworkUserAction.clearChannelLayerUsersAction({}))
    dispatchAction(AuthAction.userUpdatedAction({ user: patchedUser }))
    // if (user.partyId) {
    //   setRelationship('party', user.partyId);
    // }
    if (patchedUser.instanceId !== selfUser.instanceId.value) {
      if (worldHostID && patchedUser.instanceId && worldHostID !== patchedUser.instanceId) {
        dispatchAction(
          LocationInstanceConnectionAction.changeActiveConnectionHostId({
            currentInstanceId: worldHostID,
            newInstanceId: patchedUser.instanceId as UserId
          })
        )
      }
    }
  } else {
    const isLayerUser = userState.layerUsers.get({ noproxy: true }).find((item) => item.id === patchedUser.id)

    if (patchedUser.channelInstanceId != null && patchedUser.channelInstanceId === selfUser.channelInstanceId.value)
      dispatchAction(NetworkUserAction.addedChannelLayerUserAction({ user: patchedUser }))
    if (!isLayerUser && patchedUser.instanceId === selfUser.instanceId.value) {
      dispatchAction(NetworkUserAction.addedLayerUserAction({ user: patchedUser }))
      !getMutableState(EngineState).isEditor.value &&
        NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.joined')}`, { variant: 'default' })
    }
    if (isLayerUser && patchedUser.instanceId !== selfUser.instanceId.value) {
      dispatchAction(NetworkUserAction.removedLayerUserAction({ user: patchedUser }))
      !getMutableState(EngineState).isEditor.value &&
        NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.left')}`, { variant: 'default' })
    }
    if (patchedUser.channelInstanceId !== selfUser.channelInstanceId.value)
      dispatchAction(NetworkUserAction.removedChannelLayerUserAction({ user: patchedUser }))
  }
}
