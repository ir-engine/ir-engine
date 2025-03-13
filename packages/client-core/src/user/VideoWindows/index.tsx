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

import React, { useRef } from 'react'

import { UserID, userPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { getState, NO_PROXY, PeerID, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

import { useGet } from '@ir-engine/common'
import { EngineState } from '@ir-engine/ecs'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '@ir-engine/network/src/media/PeerMediaChannelState'
import { NetworkPeerState } from '@ir-engine/network/src/NetworkPeerState'
import {
  ArrowTopRightOnSquareLg,
  Microphone01Md,
  MicrophoneOff,
  VideoRecorderLg,
  VideoRecorderOffLg
} from '@ir-engine/ui/src/icons'
import { IoWarning } from 'react-icons/io5'

import { useClickOutside, useTouchOutside } from '@ir-engine/common/src/utils/useClickOutside'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { PopoverState } from '../../common/services/PopoverState'
import { useUserAvatarThumbnail } from '../../hooks/useUserAvatarThumbnail'
import { LocationState } from '../../social/services/LocationService'
import { FilteredUsersState } from '../../world/FilteredUsersSystem'
import ReportMenu from '../menus/ReportMenu'
import { AuthState } from '../services/AuthService'
import { ReportUserProvider, useReportUser, useUserMediaWindowHook } from './hook'
import { SingleVideoWindow, SingleVideoWindowWidget } from './window'

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
  const networkPeerState = useMutableState(NetworkPeerState).value
  const mediaNetworkUsers = mediaNetwork ? networkPeerState?.[mediaNetwork.id]?.users : undefined
  const selfUser = useMutableState(AuthState).user
  const mediaNetworkConnected = mediaNetwork && mediaNetworkInstanceState?.ready?.value

  const consumers = Object.entries(peerMediaChannelState.get(NO_PROXY)) as [
    PeerID,
    { cam: PeerMediaStreamInterface; screen: PeerMediaStreamInterface }
  ][]

  const selfPeerID = Engine.instance.store.peerID
  const selfUserID = useMutableState(EngineState).userID.value

  const camActive = (cam: PeerMediaStreamInterface) => cam.videoMediaStream || cam.audioMediaStream

  const userPeers: Array<[UserID, PeerID[]]> =
    mediaNetworkConnected && mediaNetworkUsers
      ? (Object.entries(mediaNetworkUsers) as Array<[UserID, PeerID[]]>)
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
  if (
    mediaNetworkConnected &&
    mediaNetwork.users &&
    !windows.find(({ peerID }) => mediaNetwork.users[selfUserID]?.includes(peerID))
  ) {
    windows.unshift({ peerID: selfPeerID, type: 'cam' })
  }

  const filteredUsersState = useMutableState(FilteredUsersState)

  const nearbyPeers = mediaNetwork
    ? filteredUsersState.nearbyLayerUsers.value.map((userID) => mediaNetwork.users[userID]).flat()
    : []

  return windows.filter(
    ({ peerID }) =>
      (peerID === Engine.instance.store.peerID ||
        mediaNetwork?.peers[peerID].userId === selfUserID ||
        nearbyPeers.includes(peerID)) &&
      peerMediaChannelState.value[peerID]
  )
}

export const VideoWindows = () => {
  const windows = useMediaWindows()
  return (
    <ReportUserProvider>
      <div className="flex flex-col gap-y-2">
        {windows.map(({ peerID, type }) => (
          <SingleVideoWindow type={type} peerID={peerID} key={type + '-' + peerID} />
        ))}
      </div>
      <ReportUserWindowWrapper />
    </ReportUserProvider>
  )
}

const ReportUserWindowWrapper = () => {
  const { reportedPeerId } = useReportUser()
  if (reportedPeerId) return <ReportUserWindow />
  return null
}

const ReportUserWindow = () => {
  const { t } = useTranslation()
  const { reportedPeerId, resetPeerId } = useReportUser()
  const reportedUserId = NetworkState.mediaNetwork.peers?.[reportedPeerId!]?.userId
  const avatarThumbnail = useUserAvatarThumbnail(reportedUserId)
  const reportedUser = useGet(userPath, reportedUserId).data
  const currentLocation = getState(LocationState).currentLocation.location
  const { toggleVideo, toggleAudio, audioStreamPaused, videoStreamPaused } = useUserMediaWindowHook({
    peerID: reportedPeerId!,
    type: 'cam'
  })
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => resetPeerId())
  useTouchOutside(ref, () => resetPeerId())

  if (!reportedPeerId || !reportedUserId || !reportedUser) return null

  return (
    <div
      className="fixed right-[10%] top-[5%] grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 rounded-xl bg-surface-4 p-3 lg:right-[5%]"
      ref={ref}
    >
      <div className="h-[100px] w-[100px]">
        <AvatarImage size="fill" className="rounded-none" src={avatarThumbnail} />
      </div>
      <div className="grid grid-cols-1 gap-y-6">
        <div className="col-span-1 flex items-center justify-between">
          <Text className="text-text-primary" fontWeight="medium" fontSize="lg">
            {reportedUser.name}
          </Text>
          <button className="grid h-10 w-10 rotate-180 place-items-center text-[#585858]" onClick={() => resetPeerId()}>
            <ArrowTopRightOnSquareLg />
          </button>
        </div>
        <div className="flex items-center gap-x-4">
          <button className="rounded-full bg-ui-secondary p-[15px]" onClick={() => toggleVideo()}>
            {!videoStreamPaused ? (
              <VideoRecorderOffLg className="h-5 w-5 text-text-primary-button" />
            ) : (
              <VideoRecorderLg className="h-5 w-5 text-text-primary-button" />
            )}
          </button>
          <button className="rounded-full bg-ui-secondary p-[15px]" onClick={() => toggleAudio()}>
            {!audioStreamPaused ? (
              <MicrophoneOff className="h-5 w-5 text-text-primary-button" />
            ) : (
              <Microphone01Md className="h-5 w-5 text-text-primary-button" />
            )}
          </button>
          <button
            className="rounded-full bg-ui-error p-[15px]"
            title={t('user:videoWindows.reportUser')}
            onClick={() =>
              PopoverState.showPopupover(
                <ReportMenu type="user" userId={reportedUserId} locationId={currentLocation.id} />
              )
            }
          >
            <IoWarning className="h-5 w-5 text-text-primary-button" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const VideoWindowsWidget = () => {
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
  const selfUserID = useMutableState(EngineState).userID.value
  const mediaNetwork = NetworkState.mediaNetwork

  // if window doesnt exist for self, add it
  if (!mediaNetwork || !windows.find(({ peerID }) => mediaNetwork.peers[peerID]?.userId === selfUserID)) {
    windows.unshift({ peerID: selfPeerID, type: 'cam' })
  }

  return (
    <ReportUserProvider>
      <div className="flex flex-col gap-y-2">
        {windows
          .filter(({ peerID }) => peerMediaChannelState[peerID].value)
          .map(({ peerID, type }) => (
            <SingleVideoWindowWidget type={type} peerID={peerID} key={type + '-' + peerID} />
          ))}
      </div>
    </ReportUserProvider>
  )
}
