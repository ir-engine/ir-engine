import { Object3D, PositionalAudio } from 'three'

import { addObject3DComponent } from './addObject3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { VolumetricComponent } from '../components/VolumetricComponent'
import { RenderedComponent } from '../components/RenderedComponent'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import Video from '../classes/Video'
import UpdateableObject3D from '../classes/UpdateableObject3D'
import AudioSource from '../classes/AudioSource'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { isClient } from '../../common/functions/isClient'

let DracosisPlayer = null as any
let DracosisPlayerWorker = null as any
let DracosisSequence = null as any

if (isClient) {
  Promise.all([
    import('volumetric/web/decoder/Player'),
    //@ts-ignore
    import('volumetric/web/decoder/workerFunction.ts?worker')
  ]).then(([module1, module2]) => {
    DracosisPlayer = module1.default
    DracosisPlayerWorker = module2.default
  })
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
  const posAudio = new PositionalAudio(Engine.audioListener)
  posAudio.matrixAutoUpdate = false
  addComponent(entity, PositionalAudioComponent, { value: posAudio })
  if (props.interactable) addComponent(entity, InteractableComponent, { data: props })
}

export function createVideo(entity, props: VideoProps): void {
  const video = new Video(Engine.audioListener, props.elementId!)
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
  const container = new UpdateableObject3D()
  const worker = new DracosisPlayerWorker()
  // const resourceUrl = "https://172.160.10.156:3000/static/volumetric/liam.drcs";
  const resourceUrl = props.src
  DracosisSequence = new DracosisPlayer({
    scene: container,
    renderer: Engine.renderer,
    worker: worker,
    manifestFilePath: resourceUrl.replace('.drcs', '.manifest'),
    meshFilePath: resourceUrl,
    videoFilePath: resourceUrl.replace('.drcs', '.mp4'),
    loop: props.loop,
    autoplay: props.autoPlay,
    scale: 1,
    frameRate: 25
  })

  container.update = () => {
    if (DracosisSequence.hasPlayed) {
      DracosisSequence?.handleRender(() => {})
    }
  }

  addComponent(entity, VolumetricComponent, {
    player: DracosisSequence
  })

  addComponent(entity, RenderedComponent, {})

  //temporary code
  DracosisSequence.play()

  addObject3DComponent(entity, container, props)
  if (props.interactable) addComponent(entity, InteractableComponent, { data: props })
}
