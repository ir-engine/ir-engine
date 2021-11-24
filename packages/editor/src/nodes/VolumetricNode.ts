import EditorNodeMixin from './EditorNodeMixin'
import Volumetric from '@xrengine/engine/src/scene/classes/Volumetric'
import { RethrownError } from '@xrengine/client-core/src/util/errors'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import { SceneManager } from '../managers/SceneManager'
import { ControlManager } from '../managers/ControlManager'

export default class VolumetricNode extends EditorNodeMixin(Volumetric) {
  static legacyComponentName = 'volumetric'
  static nodeName = 'Volumetric'
  static initialElementProps = {
    playMode: 3,
    paths: []
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

  constructor() {
    super(SceneManager.instance.audioListener)
    this._autoPlay = true
    this.volume = 0.5
    this.controls = true
    this.playMode = 3
    this.paths = []
  }

  get autoPlay(): any {
    return this._autoPlay
  }
  set autoPlay(value) {
    this._autoPlay = value
  }
  async load(src, onError?) {
    return this
  }

  clone(recursive): VolumetricNode {
    return new (this as any).constructor(this.audioListener).copy(this, recursive)
  }
  copy(source, recursive = true): any {
    super.copy(source, recursive)
    this.controls = source.controls
    return this
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
