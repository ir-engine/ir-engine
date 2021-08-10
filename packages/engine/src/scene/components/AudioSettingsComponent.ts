import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

class PositionalAudioSettingsComponent extends Component<PositionalAudioSettingsComponent> {
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
  static _schema = {
    avatarDistanceModel: { default: null, type: Types.Ref },
    avatarMaxDistance: { default: null, type: Types.Ref },
    avatarRefDistance: { default: null, type: Types.Ref },
    avatarRolloffFactor: { default: null, type: Types.Ref },
    mediaConeInnerAngle: { default: null, type: Types.Ref },
    mediaConeOuterAngle: { default: null, type: Types.Ref },
    mediaConeOuterGain: { default: null, type: Types.Ref },
    mediaDistanceModel: { default: null, type: Types.Ref },
    mediaMaxDistance: { default: null, type: Types.Ref },
    mediaRefDistance: { default: null, type: Types.Ref },
    mediaRolloffFactor: { default: null, type: Types.Ref },
    mediaVolume: { default: null, type: Types.Ref },
    overrideAudioSettings: { default: null, type: Types.Ref }
  }
}

export default PositionalAudioSettingsComponent
