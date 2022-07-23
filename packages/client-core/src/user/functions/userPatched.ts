import { t } from 'i18next'

import { resolveUser } from '@xrengine/common/src/interfaces/User'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { accessAuthState, AuthAction } from '../services/AuthService'
import { accessUserState, UserAction } from '../services/UserService'
import { MediaInstanceConnectionAction } from "../../common/services/MediaInstanceConnectionService";

export const userPatched = (params) => {
  console.log('USER PATCHED', params)

  const selfUser = accessAuthState().user
  const userState = accessUserState()
  const patchedUser = resolveUser(params.userRelationship)

  console.log('User patched', patchedUser)

  const worldState = getState(WorldState)
  worldState.userNames[patchedUser.id].set(patchedUser.name)

  if (selfUser.id.value === patchedUser.id) {
    if (selfUser.instanceId.value !== patchedUser.instanceId) dispatchAction(UserAction.clearLayerUsersAction({}))
    if (selfUser.channelInstanceId.value !== patchedUser.channelInstanceId)
      dispatchAction(UserAction.clearChannelLayerUsersAction({}))
    dispatchAction(AuthAction.userUpdatedAction({ user: patchedUser }))
    // if (user.partyId) {
    //   setRelationship('party', user.partyId);
    // }
    if (patchedUser.instanceId !== selfUser.instanceId.value) {
      const parsed = new URL(window.location.href)
      let query = parsed.searchParams
      query.set('instanceId', patchedUser?.instanceId || '')
      parsed.search = query.toString()

      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }

    console.log('User patched, checking if we can dispatch acceptedPartyInvite', patchedUser.partyId, selfUser.partyId.value)
    if (patchedUser.partyId && patchedUser.partyId !== selfUser.partyId.value)
      dispatchAction(MediaInstanceConnectionAction.acceptedPartyInvite())
  } else {
    const isLayerUser = userState.layerUsers.value.find((item) => item.id === patchedUser.id)

    if (patchedUser.channelInstanceId != null && patchedUser.channelInstanceId === selfUser.channelInstanceId.value)
      dispatchAction(UserAction.addedChannelLayerUserAction({ user: patchedUser }))
    if (!isLayerUser && patchedUser.instanceId === selfUser.instanceId.value) {
      dispatchAction(UserAction.addedLayerUserAction({ user: patchedUser }))
      !Engine.instance.isEditor &&
        NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.joined')}`, { variant: 'default' })
    }
    if (isLayerUser && patchedUser.instanceId !== selfUser.instanceId.value) {
      dispatchAction(UserAction.removedLayerUserAction({ user: patchedUser }))
      !Engine.instance.isEditor &&
        NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.left')}`, { variant: 'default' })
    }
    if (patchedUser.channelInstanceId !== selfUser.channelInstanceId.value)
      dispatchAction(UserAction.removedChannelLayerUserAction({ user: patchedUser }))
  }
}
