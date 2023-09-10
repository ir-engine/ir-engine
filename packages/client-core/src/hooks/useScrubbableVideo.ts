import { NO_PROXY } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import { RefObject, useEffect } from 'react'

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
        videoRef.current!.classList.add('stalled')
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
