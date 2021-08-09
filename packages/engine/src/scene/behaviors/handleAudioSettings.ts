import { addComponent } from "../../ecs/functions/EntityFunctions"
import PositionalAudioSettingsComponent from "../components/AudioSettingsComponent"

interface AudioSettings
  {
    avatarDistanceModel: string
    avatarMaxDistance: number
    avatarRefDistance: number
    avatarRolloffFactor: number
    mediaConeInnerAngle: number
    mediaConeOuterAngle: number
    mediaConeOuterGain: number
    mediaDistanceModel: string
    mediaMaxDistance: number
    mediaRefDistance: number
    mediaRolloffFactor: number
    mediaVolume: number
    overrideAudioSettings: boolean
  }

export const handleAudioSettings = (
  entity,
  {
    avatarDistanceModel,
    avatarMaxDistance,
    avatarRefDistance,
    avatarRolloffFactor,
    mediaConeInnerAngle,
    mediaConeOuterAngle,
    mediaConeOuterGain,
    mediaDistanceModel,
    mediaMaxDistance,
    mediaRefDistance,
    mediaRolloffFactor,
    mediaVolume,
    overrideAudioSettings
  }: AudioSettings
) => {
  addComponent(entity, PositionalAudioSettingsComponent, {
    avatarDistanceModel,
    avatarMaxDistance,
    avatarRefDistance,
    avatarRolloffFactor,
    mediaConeInnerAngle,
    mediaConeOuterAngle,
    mediaConeOuterGain,
    mediaDistanceModel,
    mediaMaxDistance,
    mediaRefDistance,
    mediaRolloffFactor,
    mediaVolume,
    overrideAudioSettings
  })
}

export const applyAvatarAudioSettings = (positionalAudio, positionalAudioSettings) => {
  if (positionalAudioSettings.overrideAudioSettings == false) {
    console.log('Default settings')
    return
  }
  positionalAudio.setDistanceModel(positionalAudioSettings.avatarDistanceModel)
  positionalAudio.setMaxDistance(positionalAudioSettings.avatarMaxDistance)
  positionalAudio.setRefDistance(positionalAudioSettings.avatarRefDistance)
  positionalAudio.setRolloffFactor(positionalAudioSettings.avatarRolloffFactor)
}

export const applyMediaAudioSettings = (positionalAudio, positionalAudioSettings) => {
  if (positionalAudioSettings.overrideAudioSettings == false) {
    console.log('Default settings')
    return
  }
  positionalAudio.setDistanceModel(positionalAudioSettings.mediaDistanceModel)
  positionalAudio.setMaxDistance(positionalAudioSettings.mediaMaxDistance)
  positionalAudio.setRefDistance(positionalAudioSettings.mediaRefDistance)
  positionalAudio.setRolloffFactor(positionalAudioSettings.mediaRolloffFactor)
  positionalAudio.setVolume(positionalAudioSettings.mediaVolume)
}
