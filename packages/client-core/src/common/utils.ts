import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'

export const handleSoundEffect = () => {
  AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
}

export const isValidHttpUrl = (urlString) => {
  let url

  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
