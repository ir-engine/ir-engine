import { AudioLoader } from 'three'
import { isClient } from '../../common/functions/isClient'

export const loadAudio = (src: string, audioLoader = new AudioLoader()) => {
  return new Promise<AudioBuffer | null>((resolve, reject) => {
    if (!isClient) resolve(null)
    audioLoader.load(src, resolve, undefined, (_) => {
      reject(new Error(`Error loading audio "${src}"`))
    })
  })
}
