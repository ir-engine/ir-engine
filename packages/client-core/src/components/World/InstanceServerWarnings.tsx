import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { MediaInstanceConnectionService } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { ChatService, useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { SocketWebRTCClientNetwork } from '@xrengine/client-core/src/transports/SocketWebRTCClientNetwork'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import WEBGL from '@xrengine/engine/src/renderer/THREE.WebGL'
import { addActionReceptor } from '@xrengine/hyperflux'

import { NetworkConnectionService } from '../../common/services/NetworkConnectionService'
import { LocationAction } from '../../social/services/LocationService'
import { useAuthState } from '../../user/services/AuthService'
import WarningRetryModal, { WarningRetryModalProps } from '../AlertModals/WarningRetryModal'

const initialModalValues: WarningRetryModalProps = {
  open: false,
  title: '',
  body: '',
  onClose: () => {}
}

enum WarningModalTypes {
  INDEXED_DB_NOT_SUPPORTED,
  NO_WORLD_SERVER_PROVISIONED,
  NO_MEDIA_SERVER_PROVISIONED,
  INSTANCE_DISCONNECTED,
  USER_KICKED,
  INVALID_LOCATION,
  INSTANCE_WEBGL_DISCONNECTED,
  CHANNEL_DISCONNECTED,
  DETECTED_LOW_FRAME,
  NOT_AUTHORIZED
}

const InstanceServerWarnings = () => {
  const locationState = useLocationState()
  const [modalValues, setModalValues] = useState(initialModalValues)
  const [currentError, _setCurrentError] = useState(-1)
  const invalidLocationState = locationState.invalidLocation
  const engineState = useEngineState()
  const engineRendereState = useEngineRendererState()
  const chatState = useChatState()
  const instanceConnectionState = useLocationInstanceConnectionState()
  const [erroredInstanceId, setErroredInstanceId] = useState<string>(null!)
  const [hasShownLowFramerateError, setHasShownLowFramerateError] = useState(false)
  const { t } = useTranslation()
  const authState = useAuthState()

  const selfUser = authState.user

  const currentErrorRef = useRef(currentError)
  const isWindow = (): boolean => {
    return navigator.userAgent.includes('Window')
  }

  const setCurrentError = (value) => {
    currentErrorRef.current = value
    _setCurrentError(value)
  }

  useEffect(() => {
    addActionReceptor(function InstanceServerWarningsReceptor(action) {
      matches(action)
        .when(NetworkConnectionService.actions.noWorldServersAvailable.matches, ({ instanceId }) => {
          setErroredInstanceId(instanceId)
          updateWarningModal(WarningModalTypes.NO_WORLD_SERVER_PROVISIONED)
          setCurrentError(WarningModalTypes.NO_WORLD_SERVER_PROVISIONED)
        })
        .when(NetworkConnectionService.actions.noMediaServersAvailable.matches, ({ instanceId }) => {
          setErroredInstanceId(instanceId)
          updateWarningModal(WarningModalTypes.NO_MEDIA_SERVER_PROVISIONED)
          setCurrentError(WarningModalTypes.NO_MEDIA_SERVER_PROVISIONED)
        })
        .when(WEBGL.EVENTS.webglDisconnected.matches, () => {
          updateWarningModal(WarningModalTypes.INSTANCE_WEBGL_DISCONNECTED)
          setCurrentError(WarningModalTypes.INSTANCE_WEBGL_DISCONNECTED)
        })
        .when(NetworkConnectionService.actions.worldInstanceDisconnected.matches, () => {
          updateWarningModal(WarningModalTypes.INSTANCE_DISCONNECTED)
          setCurrentError(WarningModalTypes.INSTANCE_DISCONNECTED)
        })
        .when(NetworkConnectionService.actions.worldInstanceKicked.matches, ({ message }) => {
          updateWarningModal(WarningModalTypes.USER_KICKED, message)
          setCurrentError(WarningModalTypes.USER_KICKED)
        })
        .when(NetworkConnectionService.actions.mediaInstanceDisconnected.matches, () => {
          updateWarningModal(WarningModalTypes.CHANNEL_DISCONNECTED)
          setCurrentError(WarningModalTypes.CHANNEL_DISCONNECTED)
        })
        .when(NetworkConnectionService.actions.worldInstanceReconnected.matches, () => {
          reset(WarningModalTypes.INSTANCE_DISCONNECTED)
        })
        .when(NetworkConnectionService.actions.mediaInstanceReconnected.matches, () => {
          reset(WarningModalTypes.CHANNEL_DISCONNECTED)
        })
        .when(LocationAction.socialLocationNotAuthorized.matches, () => {
          updateWarningModal(WarningModalTypes.NOT_AUTHORIZED)
          setCurrentError(WarningModalTypes.NOT_AUTHORIZED)
        })
    })

    // If user if on Firefox in Private Browsing mode, throw error, since they can't use db storage currently
    const db = indexedDB.open('test')
    db.onerror = () => updateWarningModal(WarningModalTypes.INDEXED_DB_NOT_SUPPORTED)
  }, [])

  useEffect(() => {
    if (invalidLocationState.value) {
      updateWarningModal(WarningModalTypes.INVALID_LOCATION)
    } else {
      reset()
    }
  }, [invalidLocationState.value])

  useEffect(() => {
    if (
      isWindow() &&
      engineState.joinedWorld.value &&
      engineRendereState.qualityLevel.value == 4 &&
      !hasShownLowFramerateError
    ) {
      setHasShownLowFramerateError(true)
      updateWarningModal(WarningModalTypes.DETECTED_LOW_FRAME)
    }
  }, [engineState.joinedWorld.value, engineRendereState.qualityLevel.value])

  const updateWarningModal = (type: WarningModalTypes, message?: any) => {
    switch (type) {
      case WarningModalTypes.INDEXED_DB_NOT_SUPPORTED: {
        setModalValues({
          open: true,
          title: t('common:instanceServer.browserError'),
          body: t('common:instanceServer.browserErrorMessage'),
          noCountdown: true,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.NO_WORLD_SERVER_PROVISIONED: {
        const currentLocation = locationState.currentLocation.location.value
        setModalValues({
          open: true,
          title: t('common:instanceServer.noAvailableServers'),
          body: t('common:instanceServer.noAvailableServersMessage'),
          action: async () => LocationInstanceConnectionService.provisionServer(currentLocation.id),
          parameters: [currentLocation.id, erroredInstanceId, currentLocation.sceneId],
          noCountdown: false,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.NO_MEDIA_SERVER_PROVISIONED: {
        const channels = chatState.channels.channels.value
        const partyChannel = Object.values(channels).find(
          (channel) => channel.channelType === 'party' && channel.partyId === selfUser.partyId.value
        )
        const instanceChannel = Object.values(channels).find((channel) => channel.channelType === 'instance')

        if (!partyChannel && !instanceChannel) {
          setTimeout(() => {
            ChatService.getInstanceChannel()
            updateWarningModal(WarningModalTypes.NO_MEDIA_SERVER_PROVISIONED)
          }, 2000)
          break
        } else {
          const channelId = partyChannel ? partyChannel.id : instanceChannel!.id
          setModalValues({
            open: true,
            title: t('common:instanceServer.noAvailableServers'),
            body: t('common:instanceServer.noAvailableServersMessage'),
            action: async () => MediaInstanceConnectionService.provisionServer(channelId, false),
            parameters: [channelId, false],
            noCountdown: false,
            onClose: () => {}
          })
          break
        }
      }

      case WarningModalTypes.INSTANCE_DISCONNECTED: {
        if (!Engine.instance.userId) return
        const transport = Engine.instance.currentWorld.networks.get(
          Engine.instance.currentWorld.worldNetwork?.hostId
        ) as SocketWebRTCClientNetwork
        if (engineState.isTeleporting.value || transport.reconnecting) return

        setModalValues({
          open: true,
          title: t('common:instanceServer.worldDisconnected'),
          body: t('common:instanceServer.worldDisconnectedMessage'),
          action: async () => window.location.reload(),
          timeout: 30000,
          noCountdown: false,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.CHANNEL_DISCONNECTED: {
        if (!Engine.instance.userId) return
        const transport = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
        if (transport.reconnecting) return

        const channels = chatState.channels.channels.value
        const instanceChannel = Object.values(channels).find(
          (channel) => channel.instanceId === Engine.instance.currentWorld.mediaNetwork?.hostId
        )
        setModalValues({
          open: true,
          title: 'Media disconnected',
          body: "You've lost your connection with the media server. We'll try to reconnect when the following time runs out.",
          action: async () => MediaInstanceConnectionService.provisionServer(instanceChannel?.id, true),
          timeout: 15000,
          noCountdown: false,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.INSTANCE_WEBGL_DISCONNECTED: {
        if (engineState.isTeleporting.value) return

        setModalValues({
          open: true,
          title: t('common:instanceServer.webGLNotEnabled'),
          body: t('common:instanceServer.webGLNotEnabledMessage'),
          action: async () => window.location.reload(),
          noCountdown: true,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.USER_KICKED: {
        setModalValues({
          open: true,
          title: t('common:instanceServer.youKickedFromWorld'),
          body: `${t('common:instanceServer.youKickedFromWorldMessage')}: ${message}`,
          noCountdown: true,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.INVALID_LOCATION: {
        setModalValues({
          open: true,
          title: t('common:instanceServer.invalidLocation'),
          body: `${t('common:instanceServer.cantFindLocation')} '${locationState.locationName.value}'. ${t(
            'common:instanceServer.misspelledOrNotExist'
          )}`,
          noCountdown: true,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.DETECTED_LOW_FRAME: {
        setModalValues({
          open: true,
          title: t('common:instanceServer.low-frame-title'),
          body: t('common:instanceServer.low-frame-error'),
          timeout: 10000,
          onClose: () => {}
        })
        break
      }

      case WarningModalTypes.NOT_AUTHORIZED: {
        setModalValues({
          open: true,
          title: t('common:instanceServer.notAuthorizedAtLocationTitle'),
          body: t('common:instanceServer.notAuthorizedAtLocation'),
          noCountdown: true,
          onClose: () => {}
        })
        break
      }

      default:
        return
    }
  }

  const reset = (modalType?: number) => {
    if (modalType && modalType !== currentErrorRef.current) return
    setModalValues(initialModalValues)
    setCurrentError(-1)
  }

  return (
    <WarningRetryModal
      {...modalValues}
      open={modalValues.open && !engineState.isTeleporting.value}
      onClose={() => reset()}
    />
  )
}

export default InstanceServerWarnings
