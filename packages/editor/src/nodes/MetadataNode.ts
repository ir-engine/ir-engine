import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import loadTexture from '@xrengine/engine/src/assets/functions/loadTexture'

let metadataHelperTexture = null
export default class MetadataNode extends EditorNodeMixin(Object3D) {
  static nodeName = 'Metadata'
  static legacyComponentName = '_metadata'

  static async load() {
    metadataHelperTexture = await loadTexture('/static/editor/metadata-icon.png')
  }

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { _data } = json.components.find((c) => c.name == '_metadata').props
    node._data = _data
    return node
  }

  constructor() {
    super()
    this._data = ''
    const geometry = new PlaneBufferGeometry()
    const material = new MeshBasicMaterial()
    material.map = metadataHelperTexture
    material.side = DoubleSide
    material.transparent = true
    this.helper = new Mesh(geometry, material)
    this.helper.layers.set(1)
    this.add(this.helper)
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

    this._data = source.data
    return this
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      _metadata: {
        _data: this._data
      }
    })
  }

  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('_metadata', { _data: this._data })
    this.addGLTFComponent('networked', { id: this.uuid })
    this.replaceObject()
  }
}
