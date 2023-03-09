import { useHookstate } from '@hookstate/core'
import React from 'react'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getMutableState } from '@etherealengine/hyperflux'

import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import UserMediaWindow from '../UserMediaWindow'
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
    .filter(([peerID, { cam, screen }]) => cam)
    .map(([peerID]) => {
      return { peerID, type: 'cam' as 'cam' }
    })

  windows.push(...screens, ...cams)

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
  const mediaState = useMediaStreamState()
  const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork

  const consumers = filterWindows(network, mediaState.consumers.get({ noproxy: true }))

  return (
    <div className={`${styles.userMediaWindowsContainer}`}>
      <div className={styles.userMediaWindows}>
        {(mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) && (
          <UserMediaWindow type={'screen'} peerID={network?.peerID} key={'screen_' + network?.peerID} />
        )}
        <UserMediaWindow type={'cam'} peerID={network?.peerID} key={'cam_' + network?.peerID} />
        {consumers.map(({ peerID, mediaTag }) => {
          const type = mediaTag === 'screen-video' ? 'screen' : 'cam'
          return <UserMediaWindow type={type} peerID={peerID} key={type + '_' + peerID} />
        })}
      </div>
    </div>
  )
}
