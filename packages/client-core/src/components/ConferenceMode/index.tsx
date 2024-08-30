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

import classNames from 'classnames'
import React from 'react'

import { MediaInstanceState } from '@ir-engine/client-core/src/common/services/MediaInstanceConnectionService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { MediasoupMediaProducerConsumerState } from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState, screenshareVideoDataChannelType } from '@ir-engine/network'

import { MediaStreamState } from '../../transports/MediaStreams'
import ConferenceModeParticipant from './ConferenceModeParticipant'
import styles from './index.module.scss'

const ConferenceMode = (): JSX.Element => {
  const authState = useMutableState(AuthState)
  const channelConnectionState = useMutableState(MediaInstanceState)
  const network = NetworkState.mediaNetwork
  const currentChannelInstanceConnection = network && channelConnectionState.instances[network.id].ornull
  const displayedUsers =
    network?.id && currentChannelInstanceConnection
      ? Object.values(network.peers).filter(
          (peer) => peer.peerID !== network.hostPeerID && peer.userId !== authState.user.id.value
        ) || []
      : []

  const consumers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[network.id].consumers)
  const screenShareConsumers =
    Object.values(consumers).filter((consumer) => consumer.mediaTag.value === screenshareVideoDataChannelType) || []

  const mediaStreamState = useMutableState(MediaStreamState)
  const isScreenVideoEnabled =
    mediaStreamState.screenVideoProducer.value != null && !mediaStreamState.screenShareVideoPaused.value
  const isScreenAudioEnabled =
    mediaStreamState.screenShareAudioPaused.value != null && !mediaStreamState.screenShareAudioPaused.value

  let totalScreens = 1

  if (isScreenVideoEnabled || isScreenAudioEnabled) {
    totalScreens += 1
  }

  for (let user of displayedUsers) {
    totalScreens += 1
    const peerID = Object.values(network.peers).find((peer) => peer.userId === user.userId)?.peerID
    if (screenShareConsumers.find((consumer) => consumer.peerID.value === peerID)) {
      totalScreens += 1
    }
  }

  return (
    <div
      className={classNames({
        [styles['participants']]: true,
        [styles['single-grid']]: totalScreens === 1,
        [styles['double-grid']]: totalScreens === 2 || totalScreens === 4,
        [styles['multi-grid']]: totalScreens === 3 || totalScreens > 4
      })}
    >
      {(isScreenVideoEnabled || isScreenAudioEnabled) && (
        <ConferenceModeParticipant
          type={'screen'}
          peerID={Engine.instance.store.peerID}
          key={'screen_' + Engine.instance.store.peerID}
        />
      )}
      <ConferenceModeParticipant
        type={'cam'}
        peerID={Engine.instance.store.peerID}
        key={'cam_' + Engine.instance.store.peerID}
      />
      {Object.values(consumers.value).map((consumer) => {
        const peerID = consumer.peerID
        const type = consumer.mediaTag === screenshareVideoDataChannelType ? 'screen' : 'cam'
        return <ConferenceModeParticipant type={type} peerID={peerID} key={type + '_' + peerID} />
      })}
    </div>
  )
}

export default ConferenceMode
