import { createContext, useContext } from 'react'

export const FullscreenContext = createContext<[boolean, (c: boolean) => void]>([false, () => {}])

export const useFullscreen = () => {
  return useContext(FullscreenContext)
}
