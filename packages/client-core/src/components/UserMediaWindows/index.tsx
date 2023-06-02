import { useHookstate } from '@hookstate/core'
import React from 'react'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState } from '@etherealengine/hyperflux'

import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import { UserMediaWindow, UserMediaWindowWidget } from '../UserMediaWindow'
import styles from './index.module.scss'

export const UserMediaWindows = () => {
  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState))

  const consumers = Object.entries(peerMediaChannelState.get({ noproxy: true })) as [
    PeerID,
    { cam: PeerMediaStreamInterface; screen: PeerMediaStreamInterface }
  ][]

  const windows = [] as { peerID: PeerID; type: 'cam' | 'screen' }[]

  const screens = consumers
    .filter(([peerID, { cam, screen }]) => screen?.videoStream)
    .map(([peerID]) => {
      return { peerID, type: 'screen' as 'screen' }
    })

  const cams = consumers
    .filter(
      ([peerID, { cam, screen }]) =>
        cam &&
        ((cam.videoStream && !cam.videoProducerPaused && !cam.videoStreamPaused) ||
          (cam.audioStream && !cam.audioProducerPaused && !cam.audioStreamPaused))
    )
    .map(([peerID]) => {
      return { peerID, type: 'cam' as 'cam' }
    })

  windows.push(...screens, ...cams)

  const selfPeerID = Engine.instance.peerID
  const selfUserID = Engine.instance.userId
  const mediaNetwork = Engine.instance.mediaNetwork

  // if window doesnt exist for self, add it
  if (!mediaNetwork || !windows.find(({ peerID }) => mediaNetwork.peers.get(peerID)?.userId === selfUserID)) {
    windows.unshift({ peerID: selfPeerID, type: 'cam' })
  }

  const { topShelfStyle } = useShelfStyles()

  return (
    <div className={`${styles.userMediaWindowsContainer} ${topShelfStyle}`}>
      <div className={styles.userMediaWindows}>
        {windows
          .filter(({ peerID }) => peerMediaChannelState[peerID].value)
          .map(({ peerID, type }) => (
            <UserMediaWindow type={type} peerID={peerID} key={type + '-' + peerID} />
          ))}
      </div>
    </div>
  )
}

export const UserMediaWindowsWidget = () => {
  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState))

  const consumers = Object.entries(peerMediaChannelState.get({ noproxy: true })) as [
    PeerID,
    { cam: PeerMediaStreamInterface; screen: PeerMediaStreamInterface }
  ][]

  const windows = [] as { peerID: PeerID; type: 'cam' | 'screen' }[]

  const screens = consumers
    .filter(([peerID, { cam, screen }]) => screen?.videoStream)
    .map(([peerID]) => {
      return { peerID, type: 'screen' as 'screen' }
    })

  const cams = consumers
    .filter(([peerID, { cam, screen }]) => cam)
    .map(([peerID]) => {
      return { peerID, type: 'cam' as 'cam' }
    })

  windows.push(...screens, ...cams)

  return (
    <div className={`${styles.userMediaWindowsContainer}`}>
      <div className={styles.userMediaWindows}>
        {windows
          .filter(({ peerID }) => peerMediaChannelState[peerID].value)
          .map(({ peerID, type }) => (
            <UserMediaWindowWidget type={type} peerID={peerID} key={type + '-' + peerID} />
          ))}
      </div>
    </div>
  )
}
