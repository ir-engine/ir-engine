import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LocationInstanceConnectionService } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { SocketWebRTCClientTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { Network } from '@xrengine/engine/src/networking/classes/Network'

import WarningRefreshModal, { WarningRetryModalProps } from '../AlertModals/WarningRetryModal'

type GameServerWarningsProps = {
  locationName: string
}

const initialModalValues: WarningRetryModalProps = {
  open: false,
  title: '',
  body: ''
}

enum WarningModalTypes {
  INDEXED_DB_NOT_SUPPORTED,
  NO_GAME_SERVER_PROVISIONED,
  INSTANCE_DISCONNECTED,
  USER_KICKED,
  INVALID_LOCATION,
  INSTANCE_WEBGL_DISCONNECTED
}

const GameServerWarnings = (props: GameServerWarningsProps) => {
  const locationState = useLocationState()
  const [modalValues, setModalValues] = useState(initialModalValues)
  const invalidLocationState = locationState.invalidLocation
  const engineState = useEngineState()
  const [erroredInstanceId, setErroredInstanceId] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    EngineEvents.instance.addEventListener(
      SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE,
      ({ instanceId }) => {
        setErroredInstanceId(instanceId)
        updateWarningModal(WarningModalTypes.NO_GAME_SERVER_PROVISIONED)
      }
    )

    EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_WEBGL_DISCONNECTED, () =>
      updateWarningModal(WarningModalTypes.INSTANCE_WEBGL_DISCONNECTED)
    )

    EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_DISCONNECTED, () =>
      updateWarningModal(WarningModalTypes.INSTANCE_DISCONNECTED)
    )

    EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_KICKED, ({ message }) =>
      updateWarningModal(WarningModalTypes.USER_KICKED, message)
    )

    EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.INSTANCE_RECONNECTED, reset)

    // If user if on Firefox in Private Browsing mode, throw error, since they can't use db storage currently
    var db = indexedDB.open('test')
    db.onerror = () => updateWarningModal(WarningModalTypes.INDEXED_DB_NOT_SUPPORTED)
  }, [])

  useEffect(() => {
    if (invalidLocationState.value) {
      updateWarningModal(WarningModalTypes.INVALID_LOCATION)
    } else {
      reset()
    }
  }, [invalidLocationState.value])

  const updateWarningModal = (type: WarningModalTypes, message?: any) => {
    const transport = Network.instance.transportHandler.getWorldTransport() as SocketWebRTCClientTransport
    switch (type) {
      case WarningModalTypes.INDEXED_DB_NOT_SUPPORTED:
        setModalValues({
          open: true,
          title: t('common:gameServer.browserError'),
          body: t('common:gameServer.browserErrorMessage'),
          noCountdown: true
        })
        break

      case WarningModalTypes.NO_GAME_SERVER_PROVISIONED:
        const currentLocation = locationState.currentLocation.location.value
        setModalValues({
          open: true,
          title: t('common:gameServer.noAvailableServers'),
          body: t('common:gameServer.noAvailableServersMessage'),
          action: async () => LocationInstanceConnectionService.provisionServer(currentLocation.id),
          parameters: [currentLocation.id, erroredInstanceId, currentLocation.sceneId],
          noCountdown: false
        })
        break

      case WarningModalTypes.INSTANCE_DISCONNECTED:
        if (!Engine.userId) return
        if (transport.left || engineState.isTeleporting.value) return

        setModalValues({
          open: true,
          title: t('common:gameServer.worldDisconnected'),
          body: t('common:gameServer.worldDisconnectedMessage'),
          action: async () => window.location.reload(),
          timeout: 30000,
          noCountdown: false
        })
        break

      case WarningModalTypes.INSTANCE_WEBGL_DISCONNECTED:
        if (transport.left || engineState.isTeleporting.value) return

        setModalValues({
          open: true,
          title: t('common:gameServer.webGLNotEnabled'),
          body: t('common:gameServer.webGLNotEnabledMessage'),
          action: async () => window.location.reload(),
          noCountdown: true
        })
        break

      case WarningModalTypes.USER_KICKED:
        setModalValues({
          open: true,
          title: t('common:gameServer.youKickedFromWorld'),
          body: `${t('common:gameServer.youKickedFromWorldMessage')}: ${message}`,
          noCountdown: true
        })
        break

      case WarningModalTypes.INVALID_LOCATION:
        setModalValues({
          open: true,
          title: t('common:gameServer.invalidLocation'),
          body: `${t('common:gameServer.cantFindLocation')} '${props.locationName}'. ${t(
            'common:gameServer.misspelledOrNotExist'
          )}`,
          noCountdown: true
        })
        break
      default:
        return
    }
  }

  const reset = () => {
    setModalValues(initialModalValues)
  }

  return (
    <WarningRefreshModal
      {...modalValues}
      open={modalValues.open && !engineState.isTeleporting.value}
      handleClose={reset}
    />
  )
}

export default GameServerWarnings
