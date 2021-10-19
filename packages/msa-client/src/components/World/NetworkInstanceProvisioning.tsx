import { AppAction, GeneralStateList } from '@xrengine/client-core/src/common/reducers/app/AppActions'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector'
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
import { selectInstanceConnectionState } from '../../reducers/instanceConnection/selector'
import { provisionInstanceServer, resetInstanceServer } from '../../reducers/instanceConnection/service'
import { retriveLocationByName } from './LocationLoadHelper'
import { selectChatState } from '@xrengine/client-core/src/social/reducers/chat/selector'
import { provisionChannelServer } from '../../reducers/channelConnection/service'

interface Props {
  locationName: string
  locationState?: any
  partyState?: any
  history?: any
  engineInitializeOptions?: InitializeOptions
  instanceConnectionState?: any
  //doLoginAuto?: typeof doLoginAuto
  provisionChannelServer: typeof provisionChannelServer
  provisionInstanceServer: typeof provisionInstanceServer
  resetInstanceServer: typeof resetInstanceServer
  showTouchpad?: boolean
  children?: any
  chatState?: any
  sceneId: any
  setSceneId: any
  reinit: any
  isUserBanned: any
  setIsValidLocation: any
}

const mapStateToProps = (state: any) => {
  return {
    // appState: selectAppState(state),

    instanceConnectionState: selectInstanceConnectionState(state), //
    locationState: selectLocationState(state),
    partyState: selectPartyState(state),
    chatState: selectChatState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  //doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  provisionChannelServer: bindActionCreators(provisionChannelServer, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  resetInstanceServer: bindActionCreators(resetInstanceServer, dispatch)
})

export const NetworkInstanceProvisioning = (props: Props) => {
  const { sceneId, setSceneId, reinit, isUserBanned, setIsValidLocation } = props

  const authState = useAuthState()
  const selfUser = authState.user
  const userState = useUserState()
  const dispatch = useDispatch()

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
      props.resetInstanceServer()

      if (!isUserBanned) {
        retriveLocationByName(authState, props.locationName, history)
      }
    })
  }, [])

  useEffect(() => {
    const currentLocation = props.locationState.get('currentLocation').get('location')

    if (currentLocation.id) {
      if (
        !isUserBanned &&
        !props.instanceConnectionState.get('instanceProvisioned') &&
        !props.instanceConnectionState.get('instanceProvisioning')
      ) {
        const search = window.location.search
        let instanceId

        if (search != null) {
          const parsed = url.parse(window.location.href)
          const query = querystring.parse(parsed.query!)
          instanceId = query.instanceId
        }

        if (sceneId === null) setSceneId(currentLocation.sceneId)
        props.provisionInstanceServer(currentLocation.id, instanceId || undefined, sceneId)
      }

      if (sceneId === null) setSceneId(currentLocation.sceneId)
    } else {
      if (
        !props.locationState.get('currentLocationUpdateNeeded') &&
        !props.locationState.get('fetchingCurrentLocation')
      ) {
        setIsValidLocation(false)
        dispatch(AppAction.setAppSpecificOnBoardingStep(GeneralStateList.FAILED, false))
      }
    }
  }, [props.locationState])

  useEffect(() => {
    if (
      props.instanceConnectionState.get('instanceProvisioned') &&
      props.instanceConnectionState.get('updateNeeded') &&
      !props.instanceConnectionState.get('instanceServerConnecting') &&
      !props.instanceConnectionState.get('connected')
    ) {
      reinit()
    }
  }, [props.instanceConnectionState])

  useEffect(() => {
    if (props.chatState.get('instanceChannelFetched')) {
      const channels = props.chatState.get('channels').get('channels')
      const instanceChannel = [...channels.entries()].find((channel) => channel[1].channelType === 'instance')
      props.provisionChannelServer(null!, instanceChannel[0])
    }
  }, [props.chatState.get('instanceChannelFetched')])

  return <></>
}

const connector = connect(mapStateToProps, mapDispatchToProps)(NetworkInstanceProvisioning)

export default connector
