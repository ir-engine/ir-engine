import AudioSource from '@xrengine/engine/src/scene/classes/AudioSource'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneBufferGeometry } from 'three'
import { resolveMedia } from '../functions/resolveMedia'
import loadTexture from '@xrengine/engine/src/assets/functions/loadTexture'
import EditorNodeMixin from './EditorNodeMixin'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { SceneManager } from '../managers/SceneManager'
import { ControlManager } from '../managers/ControlManager'

let audioHelperTexture = null

export default class AudioNode extends EditorNodeMixin(AudioSource) {
  static legacyComponentName = 'audio'
  static nodeName = 'Audio'
  static async load() {
    audioHelperTexture = await loadTexture('/editor/audio-icon.png')
  }
  static async deserialize(json, loadAsync, onError) {
    const node = (await super.deserialize(json)) as AudioNode
    const props = json.components.find((c) => c.name === 'audio')
    loadAsync(
      (async () => {
        node.src = props.src
        node.interactable = props.interactable
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
      })()
    )
    return node
  }
  _canonicalUrl: string = ''
  autoPlay: boolean = true
  volume: number = 0.5
  controls: boolean = true
  helper: Mesh
  constructor() {
    super(SceneManager.instance.audioListener)
    const geometry = new PlaneBufferGeometry()
    const material = new MeshBasicMaterial()
    material.map = audioHelperTexture
    material.side = DoubleSide
    material.transparent = true
    this.helper = new Mesh(geometry, material)
    this.helper.layers.set(1)
    this.add(this.helper)
  }
  get src() {
    return this._canonicalUrl
  }
  set src(value) {
    this.load(value).catch(console.error)
  }
  async load(src, onError?) {
    const nextSrc = src || ''
    if (nextSrc === this._canonicalUrl && nextSrc !== '') {
      return
    }
    this._canonicalUrl = src || ''
    this.helper.visible = false
    this.hideErrorIcon()
    if (ControlManager.instance.isInPlayMode) {
      ;(this.el as any).pause()
    }
    try {
      const { url, contentType } = await resolveMedia(src)
      await super.load(url, contentType)
      if (ControlManager.instance.isInPlayMode && this.autoPlay) {
        ;(this.el as any).play()
      }
      this.helper.visible = true
    } catch (error) {
      this.showErrorIcon()
      console.log(`Error loading audio ${this._canonicalUrl}`)
    }
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)

    // this.hideLoadingCube();
    return this
  }
  onPlay() {
    if (this.autoPlay) {
      ;(this.el as any).play()
    }
  }
  onPause() {
    ;(this.el as any).pause()
    ;(this.el as any).currentTime = 0
  }
  clone(recursive) {
    return new (this as any).constructor(this.audioListener).copy(this, recursive)
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper)
    }
    super.copy(source, recursive)
    if (recursive) {
      const helperIndex = source.children.findIndex((child) => child === source.helper)
      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex]
      }
    }
    this._canonicalUrl = source._canonicalUrl
    this.controls = source.controls
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      audio: {
        src: this._canonicalUrl,
        interactable: this.interactable,
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
        coneOuterGain: this.coneOuterGain
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('audio', {
      src: this._canonicalUrl,
      interactable: this.interactable,
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
      coneOuterGain: this.coneOuterGain
    })
    this.addGLTFComponent('networked', {
      id: this.uuid
    })
    this.replaceObject()
  }
}
