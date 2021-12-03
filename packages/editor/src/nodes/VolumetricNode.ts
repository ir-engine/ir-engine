import EditorNodeMixin from './EditorNodeMixin'
import Volumetric from '@xrengine/engine/src/scene/classes/Volumetric'
import { RethrownError } from '@xrengine/client-core/src/util/errors'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import { SceneManager } from '../managers/SceneManager'
import { ControlManager } from '../managers/ControlManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import DracosisPlayer from 'volumetric/web/decoder/Player'
//@ts-ignore
import DracosisPlayerWorker from 'volumetric/web/decoder/workerFunction.js?worker'

export default class VolumetricNode extends EditorNodeMixin(Volumetric) {
  static legacyComponentName = 'volumetric'
  static nodeName = 'Volumetric'
  static initialElementProps = {
    playMode: 3
  }
  // static initialElementProps = {
  //   src: new URL(editorLandingVolumetric, location as any).href
  // };
  // static initialElementProps = {}
  static async deserialize(json, loadAsync) {
    const node = (await super.deserialize(json)) as any
    const {
      paths,
      playMode,
      controls,
      autoPlay,
      loop,
      audioType,
      volume,
      distanceModel,
      rolloffFactor,
      refDistance,
      maxDistance,
      coneInnerAngle,
      coneOuterAngle,
      coneOuterGain,
      projection
    } = json.components.find((c) => c.name === 'volumetric').props
    loadAsync(
      (async () => {
        if (paths) node.paths = paths
        if (playMode != undefined) node.playMode = playMode
        node.controls = controls || false
        node.autoPlay = autoPlay
        node.loop = loop
        node.audioType = audioType
        node.volume = volume
        node.distanceModel = distanceModel
        node.rolloffFactor = rolloffFactor
        node.refDistance = refDistance
        node.maxDistance = maxDistance
        node.coneInnerAngle = coneInnerAngle
        node.coneOuterAngle = coneOuterAngle
        node.coneOuterGain = coneOuterGain
        node.projection = projection
      })()
    )
    return node
  }
  _autoPlay: boolean
  volume: number
  controls: boolean
  issues: any[]
  _mesh: any
  el: any
  onResize: any
  audioListener: any
  loop: any
  audioType: any
  distanceModel: any
  rolloffFactor: any
  refDistance: any
  maxDistance: any
  coneInnerAngle: any
  coneOuterAngle: any
  coneOuterGain: any
  projection: any

  UVOLPlayer: any
  UVOLWorker: any
  isUVOLPlay: boolean

  constructor() {
    super(SceneManager.instance.audioListener)
    this._autoPlay = true
    this.volume = 0.5
    this.controls = true
    this.playMode = 3
    this._paths = []
    this.UVOLWorker = new DracosisPlayerWorker()
    this.isUVOLPlay = false
  }

  get autoPlay(): any {
    return this._autoPlay
  }
  set autoPlay(value) {
    this._autoPlay = value
  }
  get paths(): any {
    return this._paths
  }
  set paths(value) {
    this._paths = [...value]
    if (value && value.length > 0 && value[0] != '') {
      this.load(value)
    }
  }
  load(paths) {
    this.isUVOLPlay = false
    if (this.UVOLPlayer) {
      this.remove(this.UVOLPlayer.mesh)
      this.UVOLPlayer.dispose()
      this.UVOLWorker = new DracosisPlayerWorker()
    }
    this.UVOLPlayer = new DracosisPlayer({
      scene: this as any,
      renderer: Engine.renderer,
      worker: this.UVOLWorker,
      paths: paths,
      playMode: this.playMode,
      loop: this.loop,
      autoplay: this.autoPlay,
      scale: 1,
      frameRate: 25,
      onMeshBuffering: (progress) => {},
      onFrameShow: () => {}
    })
  }

  onPlay() {
    if (this.UVOLPlayer) {
      if (this.isUVOLPlay) {
        this.UVOLPlayer.stopOnNextFrame = true
      } else {
        this.UVOLPlayer.stopOnNextFrame = false
        this.UVOLPlayer.play()
      }
      this.isUVOLPlay = !this.isUVOLPlay
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    }
  }

  clone(recursive): VolumetricNode {
    return new (this as any).constructor(this.audioListener).copy(this, recursive)
  }
  copy(source, recursive = true): any {
    super.copy(source, recursive)
    this.controls = source.controls
    return this
  }

  onUpdate(delta: number, time: number): void {
    if (this.UVOLPlayer && this.UVOLPlayer.hasPlayed) {
      this.UVOLPlayer?.handleRender(() => {})
    }
  }

  onRemove() {
    if (this.UVOLPlayer) {
      this.remove(this.UVOLPlayer.mesh)
      this.UVOLPlayer.dispose()
      this.UVOLWorker = new DracosisPlayerWorker()
    }
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      volumetric: {
        paths: this.paths,
        playMode: this.playMode,
        controls: this.controls,
        autoPlay: this.autoPlay,
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
        projection: this.projection
      }
    })
  }
  prepareForExport(): void {
    super.prepareForExport()
    this.addGLTFComponent('volumetric', {
      paths: this.paths,
      playMode: this.playMode,
      controls: this.controls,
      autoPlay: this.autoPlay,
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
      projection: this.projection
    })
    this.addGLTFComponent('networked', {
      id: this.uuid
    })
    this.replaceObject()
  }
}
