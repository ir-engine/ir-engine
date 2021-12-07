import { resolveUser } from '@xrengine/common/src/interfaces/User'
import { useDispatch } from '../../store'
import { UserAction } from '../services/UserService'
import { _updateUsername } from '@xrengine/engine/src/networking/utils/chatSystem'
import { hasComponent, addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { WebCamInputComponent } from '@xrengine/engine/src/input/components/WebCamInputComponent'
import { isBot } from '@xrengine/engine/src/common/functions/isBot'
import { ProximityComponent } from '../../proximity/components/ProximityComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEid } from '@xrengine/engine/src/networking/utils/getUser'
import { UserNameComponent } from '@xrengine/engine/src/scene/components/UserNameComponent'
import { accessAuthState, AuthAction } from '../services/AuthService'
import { loadAvatarForUpdatedUser } from './userAvatarFunctions'

export const userPatched = (params) => {
  const dispatch = useDispatch()

  const selfUser = accessAuthState().user
  const user = resolveUser(params.userRelationship)

  console.log('User patched', user)
  loadAvatarForUpdatedUser(user)
  _updateUsername(user.id, user.name)

  const eid = getEid(user.id)
  console.log('adding username component to user: ' + user.name + ' eid: ' + eid)
  if (eid !== undefined) {
    if (!hasComponent(eid, UserNameComponent)) {
      addComponent(eid, UserNameComponent, { username: user.name })
    } else {
      getComponent(eid, UserNameComponent).username = user.name
    }
  }

  if (selfUser.id.value === user.id) {
    if (selfUser.instanceId.value !== user.instanceId) dispatch(UserAction.clearLayerUsers())
    if (selfUser.channelInstanceId.value !== user.channelInstanceId) dispatch(UserAction.clearChannelLayerUsers())
    dispatch(AuthAction.userUpdated(user))
    if (user.partyId) {
      // setRelationship('party', user.partyId);
    }
    if (user.instanceId !== selfUser.instanceId.value) {
      const parsed = new URL(window.location.href)
      let query = parsed.searchParams
      query.set('instanceId', user?.instanceId || '')
      parsed.search = query.toString()

      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
    const world = Engine.currentWorld
    if (typeof world.localClientEntity !== 'undefined') {
      if (!hasComponent(world.localClientEntity, ProximityComponent, world) && isBot(window)) {
        addComponent(
          world.localClientEntity,
          ProximityComponent,
          {
            usersInRange: [],
            usersInIntimateRange: [],
            usersInHarassmentRange: [],
            usersLookingTowards: []
          },
          world
        )
      }
      if (!hasComponent(world.localClientEntity, WebCamInputComponent, world)) {
        addComponent(
          world.localClientEntity,
          WebCamInputComponent,
          {
            emotions: []
          },
          world
        )
      }
      console.log('added web cam input component to local client')
    }
  } else {
    if (user.channelInstanceId != null && user.channelInstanceId === selfUser.channelInstanceId.value)
      dispatch(UserAction.addedChannelLayerUser(user))
    if (user.instanceId != null && user.instanceId === selfUser.instanceId.value) {
      dispatch(UserAction.addedLayerUser(user))
      dispatch(UserAction.displayUserToast(user, { userAdded: true }))
    }
    if (user.instanceId !== selfUser.instanceId.value) {
      dispatch(UserAction.removedLayerUser(user))
      dispatch(UserAction.displayUserToast(user, { userRemoved: true }))
    }
    if (user.channelInstanceId !== selfUser.channelInstanceId.value) dispatch(UserAction.removedChannelLayerUser(user))
  }
}
