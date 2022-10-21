import { t } from 'i18next'

import { resolveUser } from '@xrengine/common/src/interfaces/User'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { LocationInstanceConnectionAction } from '../../common/services/LocationInstanceConnectionService'
import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState, AuthAction } from '../services/AuthService'
import { accessNetworkUserState, NetworkUserAction } from '../services/NetworkUserService'

const logger = multiLogger.child({ component: 'client-core:userPatched' })

export const userPatched = (params) => {
  logger.info('USER PATCHED %o', params)

  const selfUser = accessAuthState().user
  const userState = accessNetworkUserState()
  const patchedUser = resolveUser(params.userRelationship)

  logger.info('Resolved patched user %o', patchedUser)

  const worldState = getState(WorldState)
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
      if (
        Engine.instance.currentWorld._worldHostId &&
        patchedUser.instanceId &&
        Engine.instance.currentWorld._worldHostId !== patchedUser.instanceId
      ) {
        dispatchAction(
          LocationInstanceConnectionAction.changeActiveConnectionHostId({
            currentInstanceId: Engine.instance.currentWorld._worldHostId,
            newInstanceId: patchedUser.instanceId as UserId
          })
        )
      }
    }
  } else {
    const isLayerUser = userState.layerUsers.value.find((item) => item.id === patchedUser.id)

    if (patchedUser.channelInstanceId != null && patchedUser.channelInstanceId === selfUser.channelInstanceId.value)
      dispatchAction(NetworkUserAction.addedChannelLayerUserAction({ user: patchedUser }))
    if (!isLayerUser && patchedUser.instanceId === selfUser.instanceId.value) {
      dispatchAction(NetworkUserAction.addedLayerUserAction({ user: patchedUser }))
      !Engine.instance.isEditor &&
        NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.joined')}`, { variant: 'default' })
    }
    if (isLayerUser && patchedUser.instanceId !== selfUser.instanceId.value) {
      dispatchAction(NetworkUserAction.removedLayerUserAction({ user: patchedUser }))
      !Engine.instance.isEditor &&
        NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.left')}`, { variant: 'default' })
    }
    if (patchedUser.channelInstanceId !== selfUser.channelInstanceId.value)
      dispatchAction(NetworkUserAction.removedChannelLayerUserAction({ user: patchedUser }))
  }
}
