export const applyMediaAudioSettings = (positionalAudio, positionalAudioSettings, setVolume = true) => {
  if (positionalAudioSettings.overrideAudioSettings == false) {
    return
  }
  positionalAudio.setDistanceModel(positionalAudioSettings.mediaDistanceModel)
  positionalAudio.setMaxDistance(positionalAudioSettings.mediaMaxDistance)
  positionalAudio.setRefDistance(positionalAudioSettings.mediaRefDistance)
  positionalAudio.setRolloffFactor(positionalAudioSettings.mediaRolloffFactor)
  if (setVolume) positionalAudio.setVolume(positionalAudioSettings.mediaVolume)
}
