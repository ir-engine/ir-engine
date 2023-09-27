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

import { useEffect } from 'react'

export const useVideoFrameCallback = (
  video: HTMLVideoElement | null | undefined,
  callback: (videoTime: number, metadata?: VideoFrameCallbackMetadata) => void
) => {
  useEffect(() => {
    if (!video) return

    let frameId = -1
    const requestFrame = video.requestVideoFrameCallback?.bind(video) ?? requestAnimationFrame
    const cancelFrame = video.cancelVideoFrameCallback?.bind(video) ?? cancelAnimationFrame

    const callbackFrame = (now: number, metadata?: VideoFrameCallbackMetadata) => {
      const videoTime = metadata?.mediaTime ?? video.currentTime
      callback(videoTime, metadata)
      frameId = requestFrame(callbackFrame)
    }

    frameId = requestFrame(callbackFrame)
    console.log({ frameId })

    return () => cancelFrame(frameId)
  }, [video])
}
