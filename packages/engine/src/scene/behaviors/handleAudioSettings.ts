import { Behavior } from '../../common/interfaces/Behavior'

let audioArgs: any = {}

export const handleAudioSettings: Behavior = (
  entity,
  args: {
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
) => {
  // console.warn("TODO: handle audio settings, args are", args);
  audioArgs = Object.assign(args)
}

export const applyAvatarAudioSettings = (positionalAudio) => {
  if (audioArgs.overrideAudioSettings == false) {
    console.log('Default settings')
    return
  }
  positionalAudio.setDistanceModel(audioArgs.avatarDistanceModel)
  positionalAudio.setMaxDistance(audioArgs.avatarMaxDistance)
  positionalAudio.setRefDistance(audioArgs.avatarRefDistance)
  positionalAudio.setRolloffFactor(audioArgs.avatarRolloffFactor)
}

export const applyMediaAudioSettings = (positionalAudio) => {
  if (audioArgs.overrideAudioSettings == false) {
    console.log('Default settings')
    return
  }
  positionalAudio.setDistanceModel(audioArgs.mediaDistanceModel)
  positionalAudio.setMaxDistance(audioArgs.mediaMaxDistance)
  positionalAudio.setRefDistance(audioArgs.mediaRefDistance)
  positionalAudio.setRolloffFactor(audioArgs.mediaRolloffFactor)
  positionalAudio.setVolume(audioArgs.mediaVolume)
}
