import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { DataChannelType, Network } from '../networking/classes/Network'
import { NetworkState } from '../networking/NetworkState'

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export const sendResults = (results: NormalizedLandmark[]) => {
  const resultsData = results.map((val) => [val.x, val.y, val.z, val.visibility ?? 0]).flat()
  const dataBuffer = Float64Array.from([Date.now(), ...resultsData]).buffer
  return dataBuffer
}

export const receiveResults = (results: ArrayBufferLike) => {
  const data = new Float64Array(results)
  // todo - use timestamp
  const timestamp = data[0]
  const resultsData = data.slice(1)
  const landmarks = [] as NormalizedLandmark[]
  for (let i = 0; i < resultsData.length; i += 4) {
    landmarks.push({
      x: resultsData[i],
      y: resultsData[i + 1],
      z: resultsData[i + 2],
      visibility: resultsData[i + 3]
    })
  }
  return landmarks
}

export const MotionCaptureFunctions = {
  sendResults,
  receiveResults
}

export const mocapDataChannelType = 'mocap' as DataChannelType

export default async function MotionCaptureSystem() {
  const networkState = getMutableState(NetworkState)

  networkState.dataChannelRegistry.merge({
    [mocapDataChannelType]: (network: Network, fromPeerID: PeerID, message: ArrayBufferLike) => {
      if (network.isHosting) {
        network.transport.bufferToAll(mocapDataChannelType, message)
      }
      if (!timeSeriesMocapData.has(fromPeerID)) {
        timeSeriesMocapData.set(fromPeerID, [])
      }
      const data = MotionCaptureFunctions.receiveResults(message)
      timeSeriesMocapData.get(fromPeerID)!.push(data)
    }
  })

  const timeSeriesMocapData = new Map<PeerID, NormalizedLandmark[][]>()

  const execute = () => {
    const network = Engine.instance.worldNetwork
    if (!network) return

    for (const [peerID, mocapData] of timeSeriesMocapData) {
      if (!network.peers.has(peerID)) {
        timeSeriesMocapData.delete(peerID)
        continue
      }
      // console.log(timeSeriesMocapData)
      // todo - use the data
      // put on IK targets
      // dispatch ik targets action with if data has changed
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
