import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'
import AudioSource, { AudioTypes, DistanceModelTypes } from '../classes/AudioSource'

export type AudioDataProps = {
  src: string
  interactable: boolean
  controls: boolean,
  autoPlay: boolean,
  synchronize: number,
  loop: boolean,
  audioType: AudioTypes,
  volume: number,
  distanceModel: DistanceModelTypes,
  rolloffFactor: number,
  refDistance: number,
  maxDistance: number,
  coneInnerAngle: number,
  coneOuterAngle: number,
  coneOuterGain: number,
}

export class AudioData implements ComponentData {
  static legacyComponentName = ComponentNames.AUDIO

  constructor(obj3d: AudioSource, props?: AudioDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.src = props.src
      this.interactable = props.interactable
      this.controls = props.controls
      this.autoPlay = props.autoPlay
      this.synchronize = props.synchronize
      this.loop = props.loop
      this.audioType = props.audioType
      this.volume = props.volume
      this.distanceModel = props.distanceModel
      this.rolloffFactor = props.rolloffFactor
      this.refDistance = props.refDistance
      this.maxDistance = props.maxDistance
      this.coneInnerAngle = props.coneInnerAngle
      this.coneOuterAngle = props.coneOuterAngle
      this.coneOuterGain = props.coneOuterGain
    }
  }

  obj3d: AudioSource

  get src() {
    return this.obj3d.src
  }

  set src(src: string) {
    this.obj3d.src = src
  }

  get controls() {
    return this.obj3d.controls
  }

  set controls(controls: boolean) {
    this.obj3d.controls = controls
  }

  get interactable() {
    return this.obj3d.interactable
  }

  set interactable(interactable: boolean) {
    this.obj3d.interactable = interactable
  }

  get autoPlay() {
    return this.obj3d.autoPlay
  }

  set autoPlay(autoPlay: boolean) {
    this.obj3d.autoPlay = autoPlay
  }

  get synchronize() {
    return this.obj3d.synchronize
  }

  set synchronize(synchronize: number) {
    this.obj3d.synchronize = synchronize
  }

  get loop() {
    return this.obj3d.loop
  }

  set loop(loop: boolean) {
    this.obj3d.loop = loop
  }

  get audioType() {
    return this.obj3d.audioType
  }

  set audioType(audioType: AudioTypes) {
    this.obj3d.audioType = audioType
  }

  get volume() {
    return this.obj3d.volume
  }

  set volume(volume: number) {
    this.obj3d.volume = volume
  }


  get distanceModel() {
    return this.obj3d.distanceModel
  }

  set distanceModel(distanceModel: DistanceModelTypes) {
    this.obj3d.distanceModel = distanceModel
  }

  get rolloffFactor() {
    return this.obj3d.rolloffFactor
  }

  set rolloffFactor(rolloffFactor: number) {
    this.obj3d.rolloffFactor = rolloffFactor
  }

  get refDistance() {
    return this.obj3d.refDistance
  }

  set refDistance(refDistance: number) {
    this.obj3d.refDistance = refDistance
  }

  get maxDistance() {
    return this.obj3d.maxDistance
  }

  set maxDistance(maxDistance: number) {
    this.obj3d.maxDistance = maxDistance
  }

  get coneInnerAngle() {
    return this.obj3d.coneInnerAngle
  }

  set coneInnerAngle(coneInnerAngle: number) {
    this.obj3d.coneInnerAngle = coneInnerAngle
  }

  get coneOuterAngle() {
    return this.obj3d.coneOuterAngle
  }

  set coneOuterAngle(coneOuterAngle: number) {
    this.obj3d.coneOuterAngle = coneOuterAngle
  }

  get coneOuterGain() {
    return this.obj3d.coneOuterGain
  }

  set coneOuterGain(coneOuterGain: number) {
    this.obj3d.coneOuterGain = coneOuterGain
  }

  serialize(): AudioDataProps {
    return {
      src: this.src,
      interactable: this.interactable,
      controls: this.controls,
      autoPlay: this.autoPlay,
      synchronize: this.synchronize,
      loop: this.loop,
      audioType: this.audioType,
      volume: this.volume,
      distanceModel: this.distanceModel,
      rolloffFactor: this.rolloffFactor,
      refDistance: this.refDistance,
      maxDistance: this.maxDistance,
      coneInnerAngle: this.coneInnerAngle,
      coneOuterAngle: this.coneOuterAngle,
      coneOuterGain: this.coneOuterGain,
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const AudioComponent = createMappedComponent<AudioData>('AudioComponent')
