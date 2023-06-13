import { useHookstate } from '@hookstate/core'
import React from 'react'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState } from '@etherealengine/hyperflux'

import { useMediaInstance } from '../../common/services/MediaInstanceConnectionService'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import { UserMediaWindow, UserMediaWindowWidget } from '../UserMediaWindow'
import styles from './index.module.scss'

type WindowType = { peerID: PeerID; type: 'cam' | 'screen' }

const sortScreensBeforeCameras = (a: WindowType, b: WindowType) => {
  if (a.type === 'screen' && b.type === 'cam') return -1
  if (a.type === 'cam' && b.type === 'screen') return 1
  return 0
}

export const UserMediaWindows = () => {
  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState))
  const mediaNetworkInstanceState = useMediaInstance()
  const mediaNetwork = Engine.instance.mediaNetwork
  const mediaNetworkConnected = mediaNetwork && mediaNetworkInstanceState?.connected?.value

  const consumers = Object.entries(peerMediaChannelState.get({ noproxy: true })) as [
    PeerID,
    { cam: PeerMediaStreamInterface; screen: PeerMediaStreamInterface }
  ][]

  const selfPeerID = Engine.instance.peerID
  const selfUserID = Engine.instance.userId

  const camActive = (cam: PeerMediaStreamInterface) =>
    (cam.videoStream && !cam.videoProducerPaused && !cam.videoStreamPaused) ||
    (cam.audioStream && !cam.audioProducerPaused && !cam.audioStreamPaused)

  const userPeers: Array<[UserId, PeerID[]]> = mediaNetworkConnected
    ? Array.from(mediaNetwork.users.entries())
    : [[selfUserID, [selfPeerID]]]

  // reduce all userPeers to an array 'windows' of { peerID, type } objects, displaying screens first, then cams. if a user has no cameras, only include one peerID for that user
  const windows = userPeers
    .reduce((acc, [userID, peerIDs]) => {
      const userCams = consumers
        .filter(([peerID, { cam, screen }]) => peerIDs.includes(peerID) && cam && camActive(cam))
        .map(([peerID]) => {
          return { peerID, type: 'cam' as const }
        })

      const userScreens = consumers
        .filter(([peerID, { cam, screen }]) => peerIDs.includes(peerID) && screen?.videoStream)
        .map(([peerID]) => {
          return { peerID, type: 'screen' as const }
        })

      const userWindows = [...userScreens, ...userCams]
      if (userWindows.length) {
        acc.push(...userWindows)
      } else {
        acc.push({ peerID: peerIDs[0], type: 'cam' })
      }
      return acc
    }, [] as WindowType[])
    .sort(sortScreensBeforeCameras)

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
