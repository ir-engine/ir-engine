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

interface FrameData {
  frameNumber: number
  keyframeNumber: number
  startBytePosition: number
  vertices: number
  faces: number
  meshLength: number
}

export interface ManifestSchema {
  maxVertices: number
  maxTriangles: number
  frameData: FrameData[]
  frameRate: number
}

export interface requestPayload {
  frameStart: number
  frameEnd: number
}

export enum MessageType {
  /**
   * Main thread asks worker to initialize
   */
  INITIALIZE,
  /**
   * Worker notifies main thread that it has been initialized
   */
  INITIALIZED,
  /**
   * Worker receives a request to fetch and decode a range of frames
   */
  REQUEST,

  /**
   * Worker notifying main thread that it has decoded a range of frames.
   * Along with the message, it sends the decoded frames.
   */
  FRAMEDATA
}

/**
 * This is not the actual CortoBufferGeometry interface, But it is inferred from the usage.
 * It satisfies our requirements.
 */
export interface CortoBufferGeometry {
  position: Float32Array
  index: Uint16Array
  uv: Float32Array
}

export type WorkerMessage =
  | {
      type: MessageType.INITIALIZE
      payload: workerHandlerProps
    }
  | {
      type: MessageType.INITIALIZED
    }
  | {
      type: MessageType.REQUEST
      payload: requestPayload
    }
  | {
      type: MessageType.FRAMEDATA
      payload: PayLoad[]
    }

export interface PayLoad {
  frameNumber: number
  keyframeNumber: number
  bufferGeometry: CortoBufferGeometry
}

export interface workerHandlerProps {
  meshFilePath: string
  fileHeader: ManifestSchema
}
