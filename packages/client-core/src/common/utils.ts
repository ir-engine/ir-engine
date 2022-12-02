import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'

export const handleSoundEffect = (disableSoundEffects?: boolean) => {
  if (disableSoundEffects) return
  AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
}
