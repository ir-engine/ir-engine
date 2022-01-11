import EditorNodeMixin from './EditorNodeMixin'
import Video from '@xrengine/engine/src/scene/classes/Video'
import Hls from 'hls.js'
import isHLS from '@xrengine/engine/src/scene/functions/isHLS'
import { resolveMedia } from '@xrengine/engine/src/common/functions/resolveMedia'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import { SceneManager } from '../managers/SceneManager'
import { ControlManager } from '../managers/ControlManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

export default class VideoNode extends EditorNodeMixin(Video) {
  static legacyComponentName = 'video'
  static nodeName = 'Video'
  static initialElementProps = {}
  static async deserialize(json) {
    const node = (await super.deserialize(json)) as VideoNode
    const video = json.components.find((c) => c.name === 'video')
    if (video) {
      const { props } = video
      node.src = props.src
      node.interactable = props.interactable
      node.isLivestream = props.isLivestream
      node.controls = props.controls || false
      node.autoPlay = props.autoPlay
      node.synchronize = props.synchronize
      node.loop = props.loop
      node.audioType = props.audioType
      node.volume = props.volume
      node.distanceModel = props.distanceModel
      node.rolloffFactor = props.rolloffFactor
      node.refDistance = props.refDistance
      node.maxDistance = props.maxDistance
      node.coneInnerAngle = props.coneInnerAngle
      node.coneOuterAngle = props.coneOuterAngle
      node.coneOuterGain = props.coneOuterGain
      node.projection = props.projection
      node.elementId = props.elementId
    }
    return node
  }
  src = ''
  autoPlay = true
  volume = 0.5
  controls = true
  interactable = false
  isLivestream = false
  synchronize = 0
  constructor() {
    super(Engine.audioListener)
  }
  async load(onError?) {
    this.issues = []
    this.hideErrorIcon()
    if (ControlManager.instance.isInPlayMode) {
      ;(this.el as any).pause()
    }
    // if (!this.src || this.src === '') {
    //   return
    // }
    try {
      const { url, contentType } = await resolveMedia(this.src)
      const isHls = isHLS(this.src, contentType)
      if (isHls) {
        this.hls = new Hls()
      }
      super.load(this.src, contentType)
      if (isHls && this.hls) {
        this.hls.stopLoad()
      } else if ((this.el as any).duration) {
        ;(this.el as any).currentTime = 1
      }
      if (ControlManager.instance.isInPlayMode && this.autoPlay) {
        ;(this.el as any).play()
      }
      ;(this.el as any).play()
    } catch (error) {
      this.showErrorIcon()
      // const videoError = new RethrownError(
      //   `Error loading video ${this.src}`,
      //   error
      // );
      // if (onError) {
      //   onError(this, videoError);
      // }
      // console.error(videoError);
      // this.issues.push({ severity: "error", message: "Error loading video." });
    }
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)

    // this.hideLoadingCube();
    return this
  }
  onChange() {
    if (this.el.src !== this.src) this.load(this.src)
  }
  onPlay(): void {
    if (this.autoPlay) {
      ;(this.el as any).play()
    }
  }
  onPause(): void {
    ;(this.el as any).pause()
    ;(this.el as any).currentTime = 0
  }
  clone(recursive): VideoNode {
    return new (this as any).constructor(this.audioListener).copy(this, recursive)
  }
  copy(source, recursive = true): any {
    super.copy(source, recursive)
    this.controls = source.controls
    this.src = source.src
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      video: {
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
    })
  }
  prepareForExport(): void {
    super.prepareForExport()
    this.addGLTFComponent('video', {
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
    })
    this.addGLTFComponent('networked', {
      id: this.uuid
    })
    this.replaceObject()
  }
}
