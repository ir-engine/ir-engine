import React, { useEffect } from 'react'
import { useHistory } from 'react-router'

import { AppAction, GeneralStateList, useAppState } from '@xrengine/client-core/src/common/services/AppService'
import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  useMediaInstanceConnectionState
} from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaServiceReceptor, MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { MediaStreams } from '@xrengine/client-core/src/transports/MediaStreams'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserService, useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { joinCurrentWorld } from '@xrengine/engine/src/networking/functions/joinWorld'
import { JoinWorldRequestData, receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { addActionReceptor, dispatchAction, removeActionReceptor, useHookEffect } from '@xrengine/hyperflux'

import { UserServiceReceptor } from '../../user/services/UserService'
import { getSearchParamFromURL } from '../../util/getSearchParamFromURL'
import InstanceServerWarnings from './InstanceServerWarnings'

export const NetworkInstanceProvisioning = () => {
  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const chatState = useChatState()
  const locationState = useLocationState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useEngineState()
  const history = useHistory()
  const appState = useAppState()

  const worldNetworkHostId = Engine.instance.currentWorld.worldNetwork?.hostId
  const instanceConnectionState = useLocationInstanceConnectionState()
  const currentLocationInstanceConnection = instanceConnectionState.instances[worldNetworkHostId!].ornull

  const mediaNetworkHostId = Engine.instance.currentWorld.mediaNetwork?.hostId
  const channelConnectionState = useMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[mediaNetworkHostId].ornull

  MediaInstanceConnectionService.useAPIListeners()

  useEffect(() => {
    addActionReceptor(MediaServiceReceptor)
    addActionReceptor((action) => {
      matches(action).when(
        MediaStreams.actions.triggerUpdateConsumers.matches,
        MediaStreamService.triggerUpdateConsumers
      )
    })
    addActionReceptor(UserServiceReceptor)
    return () => {
      removeActionReceptor(MediaServiceReceptor)
      removeActionReceptor(UserServiceReceptor)
    }
  }, [])

  /** if the instance that got provisioned is not the one that was entered into the URL, update the URL */
  useHookEffect(() => {
    if (worldNetworkHostId) {
      const url = new URL(window.location.href)
      const searchParams = url.searchParams
      const instanceId = searchParams.get('instanceId')
      if (instanceId !== worldNetworkHostId) searchParams.set('instanceId', worldNetworkHostId)
      history.push(url.pathname + url.search)
    }
  }, [currentLocationInstanceConnection])

  // 2. once we have the location, provision the instance server
  useHookEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const isProvisioned = worldNetworkHostId && currentLocationInstanceConnection?.provisioned.value

    if (currentLocation.id?.value) {
      if (!isUserBanned && !isProvisioned) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          instanceId = new URL(window.location.href).searchParams.get('instanceId')
        }

        LocationInstanceConnectionService.provisionServer(
          currentLocation.id.value,
          instanceId || undefined,
          currentLocation.sceneId.value
        )
      }
    } else {
      if (!locationState.currentLocationUpdateNeeded.value && !locationState.fetchingCurrentLocation.value) {
        dispatchAction(
          AppAction.setAppSpecificOnBoardingStep({ onBoardingStep: GeneralStateList.FAILED, isTutorial: false })
        )
      }
    }
  }, [locationState.currentLocation.location])

  // 3. once engine is initialised and the server is provisioned, connect the the instance server
  useHookEffect(() => {
    if (
      engineState.isEngineInitialized.value &&
      currentLocationInstanceConnection?.value &&
      !currentLocationInstanceConnection.connected.value &&
      currentLocationInstanceConnection.provisioned.value &&
      !currentLocationInstanceConnection.connecting.value
    )
      LocationInstanceConnectionService.connectToServer(worldNetworkHostId)
  }, [
    engineState.isEngineInitialized,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.connecting,
    currentLocationInstanceConnection?.provisioned
  ])

  useHookEffect(() => {
    if (!engineState.connectedWorld.value || !engineState.sceneLoaded.value || engineState.joinedWorld.value) return

    const transportRequestData = {
      inviteCode: getSearchParamFromURL('inviteCode')!,
      spectateUserId: Engine.instance.isEditor ? 'none' : getSearchParamFromURL('spectate')
    } as JoinWorldRequestData

    console.log('[NetworkInstanceProvisioning]: Request Join World', { transportRequestData })

    joinCurrentWorld(transportRequestData)
  }, [engineState.connectedWorld, appState.onBoardingStep])

  // media server provisioning
  useHookEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find((channel) => channel.instanceId === worldNetworkHostId)
      MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
    }
  }, [chatState.instanceChannelFetched])

  // periodically listening for users spatially near
  useHookEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value) UserService.getLayerUsers(true)
  }, [selfUser?.instanceId, userState.layerUsersUpdateNeeded])

  // if a media connection has been provisioned and is ready, connect to it
  useHookEffect(() => {
    if (
      mediaNetworkHostId &&
      currentChannelInstanceConnection.provisioned.value === true &&
      currentChannelInstanceConnection.readyToConnect.value === true &&
      currentChannelInstanceConnection.connecting.value === false &&
      currentChannelInstanceConnection.connected.value === false
    ) {
      MediaInstanceConnectionService.connectToServer(
        mediaNetworkHostId,
        currentChannelInstanceConnection.channelId.value
      )
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
      MediaStreamService.updateScreenAudioState()
      MediaStreamService.updateScreenVideoState()
    }
  }, [
    currentChannelInstanceConnection?.connected,
    currentChannelInstanceConnection?.readyToConnect,
    currentChannelInstanceConnection?.provisioned,
    currentChannelInstanceConnection?.connecting
  ])

  return <InstanceServerWarnings />
}

export default NetworkInstanceProvisioning
