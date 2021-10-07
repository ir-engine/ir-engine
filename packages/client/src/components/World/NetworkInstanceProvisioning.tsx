import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/reducers/app/AppActions'
import { useLocationState } from '@xrengine/client-core/src/social/reducers/location/LocationState'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { UserService } from '@xrengine/client-core/src/user/store/UserService'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import querystring from 'querystring'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import url from 'url'
import { useInstanceConnectionState } from '../../reducers/instanceConnection/InstanceConnectionState'
import { InstanceConnectionService } from '../../reducers/instanceConnection/InstanceConnectionService'
import { retriveLocationByName } from './LocationLoadHelper'
import { useChatState } from '@xrengine/client-core/src/social/reducers/chat/ChatState'
import { ChannelConnectionService } from '../../reducers/channelConnection/ChannelConnectionService'

interface Props {
  locationName: string
  history?: any
  engineInitializeOptions?: InitializeOptions
  //doLoginAuto?: typeof doLoginAuto

  showTouchpad?: boolean
  children?: any
  chatState?: any
  sceneId: any
  setSceneId: any
  reinit: any
  isUserBanned: any
  setIsValidLocation: any
}

export const NetworkInstanceProvisioning = (props: Props) => {
  const { sceneId, setSceneId, reinit, isUserBanned, setIsValidLocation } = props

  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const dispatch = useDispatch()
  const chatState = useChatState()
  const locationState = useLocationState()
  const instanceConnectionState = useInstanceConnectionState()
  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value === true)
      dispatch(UserService.getLayerUsers(true))
    if (selfUser?.channelInstanceId.value != null && userState.channelLayerUsersUpdateNeeded.value === true)
      dispatch(UserService.getLayerUsers(false))
  }, [selfUser, userState.layerUsersUpdateNeeded.value, userState.channelLayerUsersUpdateNeeded.value])

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.RESET_ENGINE, async (ev: any) => {
      if (!ev.instance) return

      await shutdownEngine()
      dispatch(InstanceConnectionService.resetInstanceServer())

      if (!isUserBanned) {
        retriveLocationByName(authState, props.locationName, history)
      }
    })
  }, [])

  useEffect(() => {
    const currentLocation = locationState.currentLocation.location

    if (currentLocation.id?.value) {
      if (
        !isUserBanned &&
        !instanceConnectionState.instanceProvisioned.value &&
        !instanceConnectionState.instanceProvisioning.value
      ) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          const parsed = url.parse(window.location.href)
          const query = querystring.parse(parsed.query!)
          instanceId = query.instanceId
        }

        if (sceneId === null) setSceneId(currentLocation.sceneId.value)
        dispatch(
          InstanceConnectionService.provisionInstanceServer(currentLocation.id.value, instanceId || undefined, sceneId)
        )
      }

      if (sceneId === null) setSceneId(currentLocation.sceneId.value)
    } else {
      if (!locationState.currentLocationUpdateNeeded.value && !locationState.fetchingCurrentLocation.value) {
        setIsValidLocation(false)
        dispatch(AppAction.setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
      }
    }
  }, [locationState.currentLocation.location.value])

  useEffect(() => {
    if (
      instanceConnectionState.instanceProvisioned.value &&
      instanceConnectionState.updateNeeded.value &&
      !instanceConnectionState.instanceServerConnecting.value &&
      !instanceConnectionState.connected.value
    ) {
      reinit()
    }
  }, [instanceConnectionState])

  useEffect(() => {
    if (chatState.instanceChannelFetched.value) {
      const channels = chatState.channels.channels.value
      const instanceChannel = Object.entries(channels).find((channel) => channel[1].channelType === 'instance')
      dispatch(ChannelConnectionService.provisionChannelServer(null!, instanceChannel[0]))
    }
  }, [chatState.instanceChannelFetched.value])

  return <></>
}

const connector = NetworkInstanceProvisioning

export default connector
