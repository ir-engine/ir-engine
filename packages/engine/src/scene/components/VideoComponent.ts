import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'
import { AudioTypes, DistanceModelTypes } from '../classes/AudioSource'
import Video, { VideoProjectionType } from '../classes/Video'
import { AudioData, AudioDataProps } from './AudioComponent'

export type VideoDataProps = {
  isLivestream: boolean,
  projection: VideoProjectionType,
  elementId: string
} & AudioDataProps

export class VideoData implements ComponentData  {
  static legacyComponentName = ComponentNames.VIDEO

  constructor(obj3d: Video, props?: VideoDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.src = props.src
      this.interactable = props.interactable
      this.isLivestream = props.isLivestream
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
      this.projection = props.projection
      this.elementId = props.elementId
    }
  }

  obj3d: Video

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

  get isLivestream() {
    return this.obj3d.isLivestream
  }

  set isLivestream(isLivestream: boolean) {
    this.obj3d.isLivestream = isLivestream
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

  get projection() {
    return this.obj3d.projection
  }

  set projection(projection: VideoProjectionType) {
    this.obj3d.projection = projection
  }

  get elementId() {
    return this.obj3d.elementId
  }

  set elementId(elementId: string) {
    this.obj3d.elementId = elementId
  }

  serialize(): VideoDataProps {
    return {
      src: this.src,
      interactable: this.interactable,
      isLivestream: this.isLivestream,
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
      projection: this.projection,
      elementId: this.elementId
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const VideoComponent = createMappedComponent<VideoData>('VideoComponent')
