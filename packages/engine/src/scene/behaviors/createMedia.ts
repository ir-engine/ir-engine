import { Object3D, PositionalAudio } from 'three'

import { addObject3DComponent } from './addObject3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { VolumetricComponent } from '../components/VolumetricComponent'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
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

export function createMediaServer(entity, props: { interactable: boolean }): void {
  addObject3DComponent(entity, new Object3D(), props)
  if (props.interactable) addComponent(entity, InteractableComponent, { data: props })
}

export function createAudio(entity, props: AudioProps): void {
  const audio = new AudioSource(Engine.audioListener)
  addObject3DComponent(entity, audio, props)
  audio.load()
  addComponent(entity, PositionalAudioComponent, { value: new PositionalAudio(Engine.audioListener) })
  if (props.interactable) addComponent(entity, InteractableComponent, { data: props })
}

export function createVideo(entity, props: VideoProps): void {
  const video = new Video(Engine.audioListener, props.elementId)
  if (props.synchronize) {
    video.startTime = props.synchronize
    video.isSynced = props.synchronize > 0
  }
  addObject3DComponent(entity, video, props)
  video.load()
  if (props.interactable) addComponent(entity, InteractableComponent, { data: props })
}

interface VolumetricProps {
  src: string
  loop: number
  autoPlay: boolean
  interactable: boolean
}

export const createVolumetric = (entity, props: VolumetricProps) => {
  const container = new Object3D()

  // const worker = new PlayerWorker();
  const DracosisSequence = new DracosisPlayer({
    scene: container,
    renderer: Engine.renderer,
    // worker: worker,
    manifestFilePath: props.src.replace('.drcs', '.manifest'),
    meshFilePath: props.src,
    videoFilePath: props.src.replace('.drcs', '.mp4'),
    loop: props.loop,
    autoplay: props.autoPlay,
    scale: 1,
    frameRate: 25
  })

  addComponent(entity, VolumetricComponent, {
    player: DracosisSequence
  })

  addObject3DComponent(entity, container, props)
  if (props.interactable) addComponent(entity, InteractableComponent, { data: props })
}
