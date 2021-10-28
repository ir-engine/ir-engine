import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AudioSettingsDataProps = {
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
  usePositionalAudio: boolean
}

export class AudioSettingsData implements ComponentData {
  static legacyComponentName = ComponentNames.AUDIO_SETTINGS

  constructor(props: AudioSettingsDataProps) {
    this.avatarDistanceModel = props.avatarDistanceModel
    this.avatarMaxDistance = props.avatarMaxDistance
    this.avatarRefDistance = props.avatarRefDistance
    this.avatarRolloffFactor = props.avatarRolloffFactor
    this.mediaConeInnerAngle = props.mediaConeInnerAngle
    this.mediaConeOuterAngle = props.mediaConeOuterAngle
    this.mediaConeOuterGain = props.mediaConeOuterGain
    this.mediaDistanceModel = props.mediaDistanceModel
    this.mediaMaxDistance = props.mediaMaxDistance
    this.mediaRefDistance = props.mediaRefDistance
    this.mediaRolloffFactor = props.mediaRolloffFactor
    this.mediaVolume = props.mediaVolume
    this.usePositionalAudio = props.usePositionalAudio
  }

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
  usePositionalAudio: boolean

  serialize(): object {
    return {
      avatarDistanceModel: this.avatarDistanceModel,
      avatarMaxDistance: this.avatarMaxDistance,
      avatarRefDistance: this.avatarRefDistance,
      avatarRolloffFactor: this.avatarRolloffFactor,
      mediaConeInnerAngle: this.mediaConeInnerAngle,
      mediaConeOuterAngle: this.mediaConeOuterAngle,
      mediaConeOuterGain: this.mediaConeOuterGain,
      mediaDistanceModel: this.mediaDistanceModel,
      mediaMaxDistance: this.mediaMaxDistance,
      mediaRefDistance: this.mediaRefDistance,
      mediaRolloffFactor: this.mediaRolloffFactor,
      mediaVolume: this.mediaVolume,
      usePositionalAudio: this.usePositionalAudio
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const AudioSettingsComponent = createMappedComponent<AudioSettingsData>(
  ComponentNames.AUDIO_SETTINGS
)
