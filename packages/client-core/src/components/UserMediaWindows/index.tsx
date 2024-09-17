/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'

import { UserID } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { NO_PROXY, PeerID, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../media/PeerMediaChannelState'
import { AuthState } from '../../user/services/AuthService'
import { FilteredUsersState } from '../../world/FilteredUsersSystem'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import { UserMediaWindow, UserMediaWindowWidget } from '../UserMediaWindow'
import styles from './index.module.scss'

type WindowType = { peerID: PeerID; type: 'cam' | 'screen' }

const sortScreensBeforeCameras = (a: WindowType, b: WindowType) => {
  if (a.type === 'screen' && b.type === 'cam') return -1
  if (a.type === 'cam' && b.type === 'screen') return 1
  return 0
}

export const useMediaWindows = () => {
  const peerMediaChannelState = useMutableState(PeerMediaChannelState)
  const mediaNetworkInstanceState = useMediaNetwork()
  const mediaNetwork = NetworkState.mediaNetwork
  const selfUser = useMutableState(AuthState).user
  const mediaNetworkConnected = mediaNetwork && mediaNetworkInstanceState?.ready?.value

  const consumers = Object.entries(peerMediaChannelState.get(NO_PROXY)) as [
    PeerID,
    { cam: PeerMediaStreamInterface; screen: PeerMediaStreamInterface }
  ][]

  const selfPeerID = Engine.instance.store.peerID
  const selfUserID = Engine.instance.userID

  const camActive = (cam: PeerMediaStreamInterface) => cam.videoMediaStream || cam.audioMediaStream

  const userPeers: Array<[UserID, PeerID[]]> = mediaNetworkConnected
    ? (Object.entries(mediaNetwork.users) as Array<[UserID, PeerID[]]>)
    : [[selfUserID, [selfPeerID]]]

  // reduce all userPeers to an array 'windows' of { peerID, type } objects, displaying screens first, then cams. if a user has no cameras, only include one peerID for that user
  const windows = userPeers
    .reduce((acc, [userID, peerIDs]) => {
      const isSelfWindows = userID === selfUser.id.value
      const userCams = consumers
        .filter(([peerID, { cam, screen }]) => peerIDs.includes(peerID) && cam && camActive(cam))
        .map(([peerID]) => {
          return { peerID, type: 'cam' as const }
        })

      const userScreens = consumers
        .filter(([peerID, { cam, screen }]) => peerIDs.includes(peerID) && screen?.videoMediaStream)
        .map(([peerID]) => {
          return { peerID, type: 'screen' as const }
        })

      const userWindows = [...userScreens, ...userCams]
      if (userWindows.length) {
        if (isSelfWindows) acc.unshift(...userWindows)
        else acc.push(...userWindows)
      } else {
        if (isSelfWindows) acc.unshift({ peerID: peerIDs[0], type: 'cam' })
        else acc.push({ peerID: peerIDs[0], type: 'cam' })
      }
      return acc
    }, [] as WindowType[])
    .sort(sortScreensBeforeCameras)
    .filter(({ peerID }) => peerMediaChannelState[peerID].value)

  // if window doesnt exist for self, add it
  if (mediaNetworkConnected && !windows.find(({ peerID }) => mediaNetwork.users[selfUserID]?.includes(peerID))) {
    windows.unshift({ peerID: selfPeerID, type: 'cam' })
  }

  const filteredUsersState = useMutableState(FilteredUsersState)

  const nearbyPeers = mediaNetwork
    ? filteredUsersState.nearbyLayerUsers.value.map((userID) => mediaNetwork.users[userID]).flat()
    : []

  return windows.filter(
    ({ peerID }) =>
      (peerID === Engine.instance.store.peerID ||
        mediaNetwork?.peers[peerID].userId === Engine.instance.userID ||
        nearbyPeers.includes(peerID)) &&
      peerMediaChannelState.value[peerID]
  )
}

export const UserMediaWindows = () => {
  const { topShelfStyle } = useShelfStyles()

  const windows = useMediaWindows()

  return (
    <div className={`${styles.userMediaWindowsContainer} ${topShelfStyle}`}>
      <div className={styles.userMediaWindows}>
        {windows.map(({ peerID, type }) => (
          <UserMediaWindow type={type} peerID={peerID} key={type + '-' + peerID} />
        ))}
      </div>
    </div>
  )
}

export const UserMediaWindowsWidget = () => {
  const peerMediaChannelState = useMutableState(PeerMediaChannelState)

  const consumers = Object.entries(peerMediaChannelState.get({ noproxy: true })) as [
    PeerID,
    { cam: PeerMediaStreamInterface; screen: PeerMediaStreamInterface }
  ][]

  const windows = [] as { peerID: PeerID; type: 'cam' | 'screen' }[]

  const screens = consumers
    .filter(([peerID, { cam, screen }]) => screen?.videoMediaStream)
    .map(([peerID]) => {
      return { peerID, type: 'screen' as const }
    })

  const cams = consumers
    .filter(([peerID, { cam, screen }]) => cam && (cam.videoMediaStream || cam.audioMediaStream))
    .map(([peerID]) => {
      return { peerID, type: 'cam' as const }
    })

  windows.push(...screens, ...cams)

  const selfPeerID = Engine.instance.store.peerID
  const selfUserID = Engine.instance.userID
  const mediaNetwork = NetworkState.mediaNetwork

  // if window doesnt exist for self, add it
  if (!mediaNetwork || !windows.find(({ peerID }) => mediaNetwork.peers[peerID]?.userId === selfUserID)) {
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
