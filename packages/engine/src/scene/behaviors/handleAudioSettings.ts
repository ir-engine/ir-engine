import { Behavior } from '../../common/interfaces/Behavior';

export const handleAudioSettings: Behavior = (entity, args: {
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
}) => {
    // console.warn("TODO: handle audio settings, args are", args);
};
