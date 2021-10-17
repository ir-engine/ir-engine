import { Object3D, PositionalAudio } from 'three'

import { addObject3DComponent } from './addObject3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { InteractableComponent, InteractableData } from '../../interaction/components/InteractableComponent'
import { VolumetricComponent, VolumetricData, VolumetricDataProps } from '../components/VolumetricComponent'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import Video from '../classes/Video'
import AudioSource from '../classes/AudioSource'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { VideoComponent, VideoData, VideoDataProps } from '../components/VideoComponent'
import { AudioComponent, AudioData, AudioDataProps } from '../components/AudioComponent'

const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')

const DracosisPlayer = null as any
if (isBrowser()) {
  // import("volumetric").then(imported => {
  //   DracosisPlayer = imported;
  // });
  // import PlayerWorker from 'volumetric/src/decoder/workerFunction.ts?worker';
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

  addComponent<VolumetricData, {}>(
    entity,
    VolumetricComponent,
    new VolumetricData({ player: DracosisSequence, ...props })
  )

  addObject3DComponent(entity, container, props)
  if (props.interactable) {
    addComponent<InteractableData, {}>(
      entity,
      InteractableComponent,
      new InteractableData({ data: props })
    )
  }
}
