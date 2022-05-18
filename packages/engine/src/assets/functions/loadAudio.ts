import { AudioLoader } from 'three'

export const loadAudio = (src: string, audioLoader = new AudioLoader()) => {
  return new Promise<AudioBuffer | null>((resolve, reject) => {
    audioLoader.load(src, resolve, undefined, (_) => {
      reject(new Error(`Error loading audio "${src}"`))
    })
  })
}
