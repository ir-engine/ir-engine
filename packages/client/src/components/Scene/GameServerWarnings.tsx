import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import WarningRefreshModal, { WarningRetryModalProps } from '../AlertModals/WarningRetryModal'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { provisionInstanceServer } from '../../reducers/instanceConnection/service'

type GameServerWarningsProps = {
  isTeleporting: boolean
  instanceId: string
  locationState: any
  locationName: string
  provisionInstanceServer: typeof provisionInstanceServer
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
  INVALID_LOCATION
}

const mapStateToProps = (state: any) => {
  return {
    locationState: selectLocationState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch)
})

const GameServerWarnings = (props: GameServerWarningsProps) => {
  const [modalValues, setModalValues] = useState(initialModalValues)

  useEffect(() => {
    EngineEvents.instance.addEventListener(
      SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE,
      () => updateWarningModal(WarningModalTypes.NO_GAME_SERVER_PROVISIONED)
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
    if (props.locationState.invalidLocation) {
      updateWarningModal(WarningModalTypes.INVALID_LOCATION)
    } else {
      reset()
    }
  }, [props.locationState.invalidLocation])

  const updateWarningModal = (type: WarningModalTypes, message?: any) => {
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
        const currentLocation = props.locationState.get('currentLocation').get('location')
        setModalValues({
          open: true,
          title: 'No Available Servers',
          body: "There aren't any servers available for you to connect to. Attempting to re-connect in",
          action: async () => provisionInstanceServer(),
          parameters: [currentLocation.id, props.instanceId, currentLocation.sceneId]
        })
        break

      case WarningModalTypes.INSTANCE_DISCONNECTED:
        if ((Network.instance.transport as SocketWebRTCClientTransport).left || props.isTeleporting) return

        setModalValues({
          open: true,
          title: 'World disconnected',
          body: "You've lost your connection with the world. We'll try to reconnect before the following time runs out, otherwise you'll be forwarded to a different instance.",
          action: async () => window.location.reload(),
          timeout: 30000
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

  return <WarningRefreshModal {...modalValues} open={modalValues.open && !props.isTeleporting} handleClose={reset} />
}

export default connect(mapStateToProps, mapDispatchToProps)(GameServerWarnings)
