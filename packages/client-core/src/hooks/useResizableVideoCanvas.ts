import { useEffect, useRef } from 'react'

export const useResizableVideoCanvas = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()

  const resizeCanvas = () => {
    if (!videoRef.current) return

    if (canvasRef.current?.width !== videoRef.current?.clientWidth) {
      canvasRef.current!.width = videoRef.current!.clientWidth
    }

    if (canvasRef.current?.height !== videoRef.current?.clientHeight) {
      canvasRef.current!.height = videoRef.current!.clientHeight
    }
  }

  useEffect(() => {
    window.addEventListener('resize', () => {
      resizeCanvas()
    })
    return () => {
      window.removeEventListener('resize', () => {
        resizeCanvas()
      })
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    canvasCtxRef,
    resizeCanvas
  }
}
