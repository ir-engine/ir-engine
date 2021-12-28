import React, { useState, useEffect } from 'react'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import WarningRefreshModal, { WarningRetryModalProps } from '../AlertModals/WarningRetryModal'
import { SocketWebRTCClientTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

type GameServerWarningsProps = {
  instanceId: string
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

  useEffect(() => {
    EngineEvents.instance.addEventListener(
      SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE,
      () => updateWarningModal(WarningModalTypes.NO_GAME_SERVER_PROVISIONED)
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
          title: 'Browser Error',
          body: 'Your browser does not support storage in private browsing mode. Either try another browser, or exit private browsing mode. ',
          noCountdown: true
        })
        break

      case WarningModalTypes.NO_GAME_SERVER_PROVISIONED:
        const currentLocation = locationState.currentLocation.location.value
        setModalValues({
          open: true,
          title: 'No Available Servers',
          body: "There aren't any servers available for you to connect to. Attempting to re-connect in",
          action: async () => InstanceConnectionService.provisionInstanceServer(currentLocation.id),
          parameters: [currentLocation.id, props.instanceId, currentLocation.sceneId],
          noCountdown: false
        })
        break

      case WarningModalTypes.INSTANCE_DISCONNECTED:
        if (!Engine.userId) return
        if (transport.left || engineState.isTeleporting.value) return

        setModalValues({
          open: true,
          title: 'World disconnected',
          body: "You've lost your connection with the world. We'll try to reconnect before the following time runs out, otherwise you'll be forwarded to a different instance.",
          action: async () => window.location.reload(),
          timeout: 30000,
          noCountdown: false
        })
        break

      case WarningModalTypes.INSTANCE_WEBGL_DISCONNECTED:
        if (transport.left || engineState.isTeleporting.value) return

        setModalValues({
          open: true,
          title: 'WebGL not enabled',
          body: 'Your browser does not support WebGL, or it is disabled. Please enable WebGL or consider upgrading to the latest version of your browser.',
          action: async () => window.location.reload(),
          noCountdown: true
        })
        break

      case WarningModalTypes.USER_KICKED:
        setModalValues({
          open: true,
          title: "You've been kicked from the world",
          body: 'You were kicked from this world for the following reason: ' + message,
          noCountdown: true
        })
        break

      case WarningModalTypes.INVALID_LOCATION:
        setModalValues({
          open: true,
          title: 'Invalid location',
          body: `We can't find the location '${props.locationName}'. It may be misspelled, or it may not exist.`,
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
