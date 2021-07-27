import { MathUtils, Object3D, Audio } from 'three'

import { addObject3DComponent } from './addObject3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Interactable } from '../../interaction/components/Interactable'
import { Behavior } from '../../common/interfaces/Behavior'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import AudioSource from '../classes/AudioSource'
import { Object3DComponent } from '../components/Object3DComponent'
import { isWebWorker } from '../../common/functions/getEnvironment'
import VolumetricComponent from '../components/VolumetricComponent'
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { InteractiveSystem } from '../../interaction/systems/InteractiveSystem'
import Video from '../classes/Video'
import { Network } from '../../networking/classes/Network'
import { PrefabType } from '../../networking/templates/PrefabType'
import { Time } from '../../networking/types/SnapshotDataTypes'

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

export const elementPlaying = (element: {
  currentTime: Time
  paused: boolean
  ended: boolean
  readyState: number
}): boolean => {
  // if (isWebWorker) return element?._isPlaying;
  return element && !!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2)
}

export function createMediaServer(entity, args: { interactable: boolean }): void {
  addObject3DComponent(entity, new Object3D(), args)
  if (args.interactable) addComponent(entity, Interactable)
}

export function createAudio(entity, args: AudioProps): void {
  addObject3DComponent(entity, new Audio(Engine.audioListener), args)
  if (args.interactable) addComponent(entity, Interactable)
}

export function createVideo(entity, args: VideoProps): void {
  const video = new Video(Engine.audioListener, args.elementId)
  if (args.synchronize) {
    video.startTime = args.synchronize
    video.isSynced = args.synchronize > 0
  }
  addObject3DComponent(entity, video, { ...args })
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
  addComponent(entity, Object3DComponent, { value: container })
  if (args.interactable) addComponent(entity, Interactable)
}
