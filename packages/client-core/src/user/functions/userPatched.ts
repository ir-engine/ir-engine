import { t } from 'i18next'

import { resolveUser } from '@xrengine/common/src/interfaces/User'
import { addComponent, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEid } from '@xrengine/engine/src/networking/utils/getUser'
import { UserNameComponent } from '@xrengine/engine/src/scene/components/UserNameComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { _updateUsername } from '../../social/services/utils/chatSystem'
import { useDispatch } from '../../store'
import { accessAuthState, AuthAction } from '../services/AuthService'
import { accessUserState, UserAction } from '../services/UserService'

// import { loadAvatarForUpdatedUser } from './userAvatarFunctions'

export const userPatched = (params) => {
  console.log('USER PATCHED', params)
  const dispatch = useDispatch()

  const selfUser = accessAuthState().user
  const userState = accessUserState()
  const patchedUser = resolveUser(params.userRelationship)

  console.log('User patched', patchedUser)
  // loadAvatarForUpdatedUser(user)
  _updateUsername(patchedUser.id, patchedUser.name)

  const eid = getEid(patchedUser.id)
  console.log('adding username component to user: ' + patchedUser.name + ' eid: ' + eid)
  if (eid !== undefined) {
    if (!hasComponent(eid, UserNameComponent)) {
      addComponent(eid, UserNameComponent, { username: patchedUser.name })
    } else {
      getComponent(eid, UserNameComponent).username = patchedUser.name
    }
  }

  if (selfUser.id.value === patchedUser.id) {
    if (selfUser.instanceId.value !== patchedUser.instanceId) dispatchAction(UserAction.clearLayerUsersAction())
    if (selfUser.channelInstanceId.value !== patchedUser.channelInstanceId)
      dispatchAction(UserAction.clearChannelLayerUsersAction())
    dispatch(AuthAction.userUpdated(patchedUser))
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
  } else {
    const isLayerUser = userState.layerUsers.value.find((item) => item.id === patchedUser.id)

    if (patchedUser.channelInstanceId != null && patchedUser.channelInstanceId === selfUser.channelInstanceId.value)
      dispatchAction(UserAction.addedChannelLayerUserAction({ user: patchedUser }))
    if (!isLayerUser && patchedUser.instanceId === selfUser.instanceId.value) {
      dispatchAction(UserAction.addedLayerUserAction({ user: patchedUser }))
      NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.joined')}`, { variant: 'default' })
    }
    if (isLayerUser && patchedUser.instanceId !== selfUser.instanceId.value) {
      dispatchAction(UserAction.removedLayerUserAction({ user: patchedUser }))
      NotificationService.dispatchNotify(`${patchedUser.name} ${t('common:toast.left')}`, { variant: 'default' })
    }
    if (patchedUser.channelInstanceId !== selfUser.channelInstanceId.value)
      dispatchAction(UserAction.removedChannelLayerUserAction({ user: patchedUser }))
  }
}
