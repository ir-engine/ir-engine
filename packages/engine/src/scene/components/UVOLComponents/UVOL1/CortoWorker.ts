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

import { CortoDecoder } from './corto'
import {
  CortoBufferGeometry,
  MessageType,
  PayLoad,
  WorkerMessage,
  requestPayload,
  workerHandlerProps
} from './interfaces'

let timer: NodeJS.Timer

const messageQueue: requestPayload[] = []

function addMessageToQueue(payload: requestPayload) {
  messageQueue.push(payload)
}

function startHandlerLoop({ meshFilePath, fileHeader }: workerHandlerProps) {
  ;(globalThis as any).postMessage({ type: MessageType.INITIALIZED })

  timer = setInterval(async () => {
    if (messageQueue.length < 1) return

    const { frameStart, frameEnd } = messageQueue.shift()!

    try {
      const startFrameData = fileHeader.frameData[frameStart]
      const endFrameData = fileHeader.frameData[frameEnd - 1]
      const requestStartBytePosition = startFrameData.startBytePosition
      const requestEndBytePosition = endFrameData.startBytePosition + endFrameData.meshLength

      const outgoingMessages: PayLoad[] = []

      const response = await fetch(meshFilePath, {
        headers: {
          range: `bytes=${requestStartBytePosition}-${requestEndBytePosition}`
        }
      }).catch((err) => {
        console.error('WORKERERROR: ', err)
      })

      const buffer = await (response as Response).arrayBuffer()

      const transferables: ArrayBufferLike[] = []
      for (let i = frameStart; i < frameEnd; i++) {
        const currentFrameData = fileHeader.frameData[i]

        const fileReadStartPosition = currentFrameData.startBytePosition - startFrameData.startBytePosition
        const fileReadEndPosition = fileReadStartPosition + currentFrameData.meshLength

        // Decode the geometry using Corto codec
        const slice = (buffer as ArrayBuffer).slice(fileReadStartPosition, fileReadEndPosition)
        const decoder = new CortoDecoder(slice)
        const bufferGeometry: CortoBufferGeometry = decoder.decode()
        transferables.push(bufferGeometry.index.buffer)
        transferables.push(bufferGeometry.position.buffer)
        transferables.push(bufferGeometry.uv.buffer)

        // Add to the messageQueue
        outgoingMessages.push({
          frameNumber: currentFrameData.frameNumber,
          keyframeNumber: currentFrameData.keyframeNumber,
          bufferGeometry
        })
      }
      ;(globalThis as any).postMessage({ type: MessageType.FRAMEDATA, payload: outgoingMessages }, transferables)
    } catch (error) {
      ;(globalThis as any).postMessage({ type: MessageType.FRAMEDATA, payload: [] })
      console.error('WORKERERROR: ', error, frameStart, frameEnd)
    }
  }, 100)
}

;(globalThis as any).onmessage = function ({ data }: { data: WorkerMessage }) {
  if (data.type === MessageType.INITIALIZE) {
    messageQueue.length = 0
    if (timer) {
      clearInterval(timer)
    }
    startHandlerLoop(data.payload)
  } else if (data.type === MessageType.REQUEST) {
    addMessageToQueue(data.payload)
  }
}
