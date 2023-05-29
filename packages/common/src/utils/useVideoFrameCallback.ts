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

    return () => cancelFrame(frameId)
  }, [video])
}
