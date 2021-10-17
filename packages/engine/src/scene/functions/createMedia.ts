import { Object3D, PositionalAudio } from 'three'

import { addObject3DComponent } from './addObject3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { InteractableComponent, InteractableData } from '../../interaction/components/InteractableComponent'
import { VolumetricComponent, VolumetricData, VolumetricDataProps } from '../components/VolumetricComponent'
import { RenderedComponent } from '../components/RenderedComponent'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import Video from '../classes/Video'
import UpdateableObject3D from '../classes/UpdateableObject3D'
import AudioSource from '../classes/AudioSource'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { VideoComponent, VideoData, VideoDataProps } from '../components/VideoComponent'
import { AudioComponent, AudioData, AudioDataProps } from '../components/AudioComponent'
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

export function createMediaServer(entity, props: { interactable: boolean }): void {
  if (props.interactable) {
    addComponent<InteractableData, {}>(
      entity,
      InteractableComponent,
      new InteractableData({ data: props })
    )
  }
}

export function createAudio(entity, props: AudioDataProps): void {
  const audio = getComponent(entity, Object3DComponent).value as AudioSource
  audio.audioListener = Engine.audioListener

  addComponent<AudioData, {}>(
    entity,
    AudioComponent,
    new AudioData(audio, props)
  )

  audio.load()

  const posAudio = new PositionalAudio(Engine.audioListener)

  posAudio.matrixAutoUpdate = false

  addComponent(entity, PositionalAudioComponent, { value: posAudio })

  if (props.interactable) {
    addComponent<InteractableData, {}>(
      entity,
      InteractableComponent,
      new InteractableData({ data: props })
    )
  }
}

export function createVideo(entity, props: VideoDataProps): void {
  const video = getComponent(entity, Object3DComponent).value as Video
  video.audioListener = Engine.audioListener
  video.elementId = props.elementId!

  if (props.synchronize) {
    video.startTime = props.synchronize
    video.isSynced = props.synchronize > 0
  }

  addComponent<VideoData, {}>(
    entity,
    VideoComponent,
    new VideoData(video, props)
  )

  video.load()
  if (props.interactable) {
    addComponent<InteractableData, {}>(
      entity,
      InteractableComponent,
      new InteractableData({ data: props })
    )
  }
}

export const createVolumetric = (entity, props: VolumetricDataProps) => {
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

  addComponent<VolumetricData, {}>(
    entity,
    VolumetricComponent,
    new VolumetricData({ player: DracosisSequence, ...props })
  )

  addComponent(entity, RenderedComponent, {})

  //temporary code
  DracosisSequence.play()

  addObject3DComponent(entity, container, props)
  if (props.interactable) {
    addComponent<InteractableData, {}>(
      entity,
      InteractableComponent,
      new InteractableData({ data: props })
    )
  }
}
