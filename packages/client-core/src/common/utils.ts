import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'

export const handleSoundEffect = () => {
  AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
}
