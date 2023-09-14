import { useEffect } from 'react'

export const useRemoveEngineCanvas = () => {
  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas')!
    canvas.parentElement?.removeChild(canvas)

    return () => {
      const body = document.body
      body.appendChild(canvas)
    }
  }, [])

  return null
}
