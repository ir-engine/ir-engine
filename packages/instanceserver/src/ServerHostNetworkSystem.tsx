/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { updatePeers } from '@etherealengine/engine/src/networking/systems/OutgoingActionSystem'
import { useEffect } from 'react'

import { RecordingAPIState } from '@etherealengine/engine/src/recording/ECSRecordingSystem'
import { staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { recordingResourcePath } from '@etherealengine/engine/src/schemas/recording/recording-resource.schema'
import { RecordingID } from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { getMutableState, none } from '@etherealengine/hyperflux'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getCachedURL } from '@etherealengine/server-core/src/media/storageprovider/getCachedURL'
import { getStorageProvider } from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { createStaticResourceHash } from '@etherealengine/server-core/src/media/upload-asset/upload-asset.service'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

export async function validateNetworkObjects(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of Object.entries(network.peers)) {
    if (client.userId === Engine.instance.userID) continue
    if (Date.now() - client.lastSeenTs > 10000) {
      NetworkPeerFunctions.destroyPeer(network, peerID as PeerID)
      updatePeers(network)
    }
  }
}

const execute = () => {
  const worldNetwork = Engine.instance.worldNetwork as SocketWebRTCServerNetwork
  if (worldNetwork) {
    if (worldNetwork.isHosting) validateNetworkObjects(worldNetwork)
  }
}

export const uploadRecordingStaticResource = async (props: {
  recordingID: RecordingID
  key: string
  body: Buffer
  mimeType: string
}) => {
  const api = Engine.instance.api

  const storageProvider = getStorageProvider()
  await storageProvider.putObject({
    Key: props.key,
    Body: props.body,
    ContentType: props.mimeType
  })

  const provider = getStorageProvider()
  const url = getCachedURL(props.key, provider.cacheDomain)
  const hash = createStaticResourceHash(props.body, { assetURL: props.key })

  const staticResource = await api.service(staticResourcePath).create(
    {
      hash,
      key: props.key,
      url,
      mimeType: props.mimeType
    },
    { isInternal: true }
  )

  await api.service(recordingResourcePath).create({
    staticResourceId: staticResource.id,
    recordingId: props.recordingID
  })
}

const reactor = () => {
  useEffect(() => {
    getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: uploadRecordingStaticResource })
    return () => {
      getMutableState(RecordingAPIState).uploadRecordingChunk.set(none)
    }
  }, [])

  return null
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'ee.instanceserver.ServerHostNetworkSystem',
  execute,
  reactor
})
