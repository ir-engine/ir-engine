import { Object3D } from 'three'

import { addObject3DComponent } from './addObject3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Interactable } from '../../interaction/components/Interactable'
import VolumetricComponent from '../components/VolumetricComponent'
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import Video from '../classes/Video'
import AudioSource from '../classes/AudioSource'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'

const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')

const DracosisPlayer = null
if (isBrowser()) {
  // import("volumetric").then(imported => {
  //   DracosisPlayer = imported;
  // });
  // @ts-ignore
  // import PlayerWorker from 'volumetric/src/decoder/workerFunction.ts?worker';
}

export interface AudioProps {
  src?: string
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  synchronize?: number
  audioType?: 'stereo' | 'pannernode'
  volume?: number
  distanceModel?: 'linear' | 'inverse' | 'exponential'
  rolloffFactor?: number
  refDistance?: number
  maxDistance?: number
  coneInnerAngle?: number
  coneOuterAngle?: number
  coneOuterGain?: number
  interactable?: boolean
}

export interface VideoProps extends AudioProps {
  isLivestream?: boolean
  elementId?: string
  projection?: 'flat' | '360-equirectangular'
}

export function createMediaServer(entity, args: { interactable: boolean }): void {
  addObject3DComponent(entity, new Object3D(), args)
  if (args.interactable) addComponent(entity, Interactable)
}

export function createAudio(entity, args: AudioProps): void {
  const audio = new AudioSource(Engine.audioListener)
  addObject3DComponent(entity, audio, args)
  audio.load()
  addComponent(entity, PositionalAudioComponent)
  if (args.interactable) addComponent(entity, Interactable)
}

export function createVideo(entity, args: VideoProps): void {
  const video = new Video(Engine.audioListener, args.elementId)
  if (args.synchronize) {
    video.startTime = args.synchronize
    video.isSynced = args.synchronize > 0
  }
  addObject3DComponent(entity, video, args)
  video.load()
  if (args.interactable) addComponent(entity, Interactable)
}

interface VolumetricProps {
  src: string
  loop: number
  autoPlay: boolean
  interactable: boolean
}

export const createVolumetric = (entity, args: VolumetricProps) => {
  addComponent(entity, VolumetricComponent)
  const volumetricComponent = getMutableComponent(entity, VolumetricComponent)
  const container = new Object3D()

  // const worker = new PlayerWorker();
  const DracosisSequence = new DracosisPlayer({
    scene: container,
    renderer: Engine.renderer,
    // worker: worker,
    manifestFilePath: args.src.replace('.drcs', '.manifest'),
    meshFilePath: args.src,
    videoFilePath: args.src.replace('.drcs', '.mp4'),
    loop: args.loop,
    autoplay: args.autoPlay,
    scale: 1,
    frameRate: 25
  })
  volumetricComponent.player = DracosisSequence
  addObject3DComponent(entity, container, args)
  if (args.interactable) addComponent(entity, Interactable)
}
