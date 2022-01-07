import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/services/AppService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { UserService } from '@xrengine/client-core/src/user/services/UserService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { retriveLocationByName } from './LocationLoadHelper'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useInstanceConnectionState } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import {
  ChannelConnectionService,
  useChannelConnectionState
} from '@xrengine/client-core/src/common/services/ChannelConnectionService'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import WarningRefreshModal, { WarningRetryModalProps } from '../AlertModals/WarningRetryModal'

interface Props {
  locationName: string
}

export const NetworkInstanceProvisioning = (props: Props) => {
  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const dispatch = useDispatch()
  const chatState = useChatState()
  const locationState = useLocationState()
  const instanceConnectionState = useInstanceConnectionState()
  const channelConnectionState = useChannelConnectionState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const engineState = useEngineState()

  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // 1. Ensure api server connection in and set up reset listener
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    const action = async (ev: any) => {
      if (!ev.instance) return
      await shutdownEngine()
      InstanceConnectionService.resetInstanceServer()
      if (!isUserBanned) {
        retriveLocationByName(authState, props.locationName, history)
      }
    }
    if (engineState.socketInstance.value) action({ instance: true })
  }, [engineState.socketInstance.value])

  // 2. once we have the location, provision the instance server
  useEffect(() => {
    const currentLocation = locationState.currentLocation.location
    const locationType = currentLocation.locationSettings.locationType.value

    if (currentLocation.id?.value.length > 0) {
      const isUserAuthorized =
        (locationType && locationType !== 'private') ||
        (locationType === 'private' &&
          currentLocation.locationAuthorizedUsers.value.find((locAuthUser) => locAuthUser.userId === selfUser.id.value))
      if (
        !isUserBanned &&
        isUserAuthorized &&
        !instanceConnectionState.instanceProvisioned.value &&
        !instanceConnectionState.instanceProvisioning.value
      ) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          const parsed = new URL(window.location.href).searchParams.get('instanceId')
          instanceId = parsed
        }

        InstanceConnectionService.provisionInstanceServer(
          currentLocation.id.value,
          instanceId || undefined,
          locationState.currentLocation.location.sceneId.value
        )
      } else {
        if (isUserBanned) {
          setModalOpen(true)
          setTitle('You are banned')
          setBody('You are banned from this location')
        }
        if (!isUserAuthorized) {
          let body
          if (selfUser.userRole.value === 'guest')
            body = 'Guest users are not allowed at this location. Try signing in and then returning.'
          else body = 'You are not authorized to be at this location. Try signing in with a different account.'
          setModalOpen(true)
          setTitle('Not authorized')
          setBody(body)
        }
      }
    } else {
      if (!locationState.currentLocationUpdateNeeded.value && !locationState.fetchingCurrentLocation.value) {
        dispatch(AppAction.setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
      }
    }
  }, [locationState.currentLocation.location.value])

  // 3. once engine is initialised and the server is provisioned, connect the the instance server
  useEffect(() => {
    if (
      engineState.isEngineInitialized.value &&
      !instanceConnectionState.connected.value &&
      instanceConnectionState.instanceProvisioned.value &&
      !instanceConnectionState.instanceServerConnecting.value
    )
      InstanceConnectionService.connectToInstanceServer()
  }, [
    engineState.isEngineInitialized.value,
    instanceConnectionState.connected.value,
    instanceConnectionState.instanceServerConnecting.value,
    instanceConnectionState.instanceProvisioned.value
  ])

  useEffect(() => {
    if (engineState.connectedWorld.value && engineState.sceneLoaded.value) {
      Network.instance.transportHandler
        .getWorldTransport()
        .request(MessageTypes.JoinWorld.toString())
        .then(receiveJoinWorld)
    }
  }, [engineState.connectedWorld.value, engineState.sceneLoaded.value])

  useEffect(() => {
    if (engineState.joinedWorld.value) {
      if (engineState.isTeleporting.value) dispatchLocal(EngineActions.setTeleporting(null!))
      dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))
      dispatch(AppAction.setAppLoaded(true))
    }
  }, [engineState.joinedWorld.value])

  // channel server provisioning (if needed)
  useEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.values(channels).find(
        (channel) => channel.instanceId === instanceConnectionState.instance.id.value
      )
      ChannelConnectionService.provisionChannelServer(instanceChannel?.id, true)
    }
  }, [chatState.instanceChannelFetched.value])

  // periodically listening for users spatially near
  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value) UserService.getLayerUsers(true)
  }, [selfUser, userState.layerUsersUpdateNeeded.value])

  // if a media connection has been provisioned and is ready, connect to it
  useEffect(() => {
    if (
      channelConnectionState.instanceProvisioned.value === true &&
      channelConnectionState.updateNeeded.value === true &&
      channelConnectionState.instanceServerConnecting.value === false &&
      channelConnectionState.connected.value === false
    ) {
      ChannelConnectionService.connectToChannelServer(channelConnectionState.channelId.value)
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
    }
  }, [
    channelConnectionState.connected.value,
    channelConnectionState.updateNeeded.value,
    channelConnectionState.instanceProvisioned.value,
    channelConnectionState.instanceServerConnecting.value
  ])

  return <WarningRefreshModal open={modalOpen} title={title} body={body} noCountdown={true} />
}
