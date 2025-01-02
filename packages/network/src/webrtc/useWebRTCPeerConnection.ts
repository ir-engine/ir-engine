import { Engine } from '@ir-engine/ecs'
import { PeerID, UserID, dispatchAction, getState, useMutableState } from '@ir-engine/hyperflux'
import { decode, encode } from 'msgpackr'
import { useEffect } from 'react'
import { DataChannelType } from '../DataChannelRegistry'
import { Network } from '../Network'
import { NetworkActions } from '../NetworkState'
import { RTCPeerConnectionState, SendMessageType, WebRTCTransportFunctions } from './WebRTCTransportFunctions'

export const useWebRTCPeerConnection = (
  network: Network,
  peerID: PeerID,
  peerIndex: number,
  userID: UserID,
  sendMessage: SendMessageType
) => {
  const networkID = network.id

  useEffect(() => {
    const abortController = new AbortController()

    /**
     * We only need one peer to initiate the connection, so do so if the peerID is greater than our own.
     */
    const isInitiator = Engine.instance.store.peerID > peerID

    if (isInitiator) {
      // poll to ensure the other peer's listener has been set up before we try to connect

      WebRTCTransportFunctions.poll(sendMessage, networkID, peerID)

      const interval = setInterval(() => {
        if (abortController.signal.aborted || getState(RTCPeerConnectionState)[networkID]?.[peerID]) {
          clearInterval(interval)
        } else {
          WebRTCTransportFunctions.poll(sendMessage, networkID, peerID)
        }
      }, 1000)
    }

    return () => {
      abortController.abort()
      WebRTCTransportFunctions.close(networkID, peerID)
    }
  }, [])

  const peerConnectionState = useMutableState(RTCPeerConnectionState)[networkID][peerID]?.value

  useEffect(() => {
    if (!peerConnectionState || !peerConnectionState.ready || !peerConnectionState.dataChannels['actions']) return

    const dataChannel = peerConnectionState.dataChannels['actions'] as RTCDataChannel

    dispatchAction(
      NetworkActions.peerJoined({
        $network: networkID,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID: peerID,
        peerIndex: peerIndex,
        userID: userID
      })
    )

    let receivedPoll = false

    const onMessage = (e) => {
      if (e.data === '') {
        receivedPoll = true
        return
      }
      const message = decode(e.data)

      network.onMessage(peerID, message)
    }

    dataChannel.addEventListener('message', onMessage)

    const message = (data) => {
      dataChannel.send(encode(data))
    }

    const buffer = (dataChannelType: DataChannelType, data: any) => {
      const dataChannel = peerConnectionState.dataChannels[dataChannelType] as RTCDataChannel
      if (!dataChannel || dataChannel.readyState !== 'open') return
      const fromPeerID = Engine.instance.store.peerID
      const fromPeerIndex = network.peerIDToPeerIndex[fromPeerID]
      if (typeof fromPeerIndex === 'undefined')
        return console.warn('fromPeerIndex is undefined', fromPeerID, fromPeerIndex)
      dataChannel.send(encode([fromPeerIndex, data]))
    }

    network.transports[peerID] = {
      message,
      buffer
    }

    /**
     * Poll the data channel until it's open, then send a message to the peer to let them know we're ready to receive messages.
     */
    const interval = setInterval(() => {
      if (dataChannel.readyState === 'open') {
        dataChannel.send('')
        if (receivedPoll) {
          clearInterval(interval)
          // once connected, send all our cached actions to the peer
          const selfCachedActions = Engine.instance.store.actions.cached.filter(
            (action) => action.$topic === network.topic
          )
          network.messageToPeer(peerID, selfCachedActions)
        }
      }
    }, 10)

    return () => {
      clearInterval(interval)
      dispatchAction(
        NetworkActions.peerLeft({
          $network: network.id,
          $topic: network.topic,
          $to: Engine.instance.store.peerID,
          peerID: peerID,
          userID: userID
        })
      )
      dataChannel.removeEventListener('message', onMessage)
    }
  }, [peerConnectionState?.ready, peerConnectionState?.dataChannels?.['actions']])
}
