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

import { RefObject, useEffect } from 'react'

import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'

export const useScrubbableVideo = (videoRef: RefObject<HTMLVideoElement>) => {
  const scrubState = useHookstate({
    isSeeking: false,
    targetSeekTime: 0,
    stalledTimeout: null as null | ReturnType<typeof setTimeout>
  })

  const handlePositionChange = (time: number) => {
    scrubState.targetSeekTime.set(time)
    if (!scrubState.isSeeking.value) videoRef.current!.currentTime = scrubState.targetSeekTime.value
  }

  const onSeeking = () => {
    scrubState.stalledTimeout.set(
      setTimeout(() => {
        if (!videoRef.current) return
        videoRef.current.classList.add('stalled')
      }, 2000)
    ) // mark as "stalled" after 2 seconds
  }

  const onSeeked = () => {
    if (scrubState.stalledTimeout.value) clearTimeout(scrubState.get(NO_PROXY).stalledTimeout!)
    videoRef.current!.classList.remove('stalled')

    if (scrubState.targetSeekTime == null || videoRef.current!.currentTime === scrubState.targetSeekTime.value) return
    videoRef.current!.currentTime = scrubState.targetSeekTime.value
  }

  useEffect(() => {
    const video = videoRef.current!
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('seeked', onSeeked)
    return () => {
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [videoRef.current])

  return { handlePositionChange }
}
