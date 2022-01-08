import { DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from 'three'

import loadTexture from '@xrengine/engine/src/assets/functions/loadTexture'

import EditorNodeMixin from './EditorNodeMixin'

let linkHelperTexture = null
export default class LinkNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'link'
  static nodeName = 'Link'
  static async load() {
    linkHelperTexture = await loadTexture('/static/editor/link-icon.png')
  }
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { href } = json.components.find((c) => c.name === 'link').props
    node.href = href
    return node
  }
  constructor() {
    super()
    this.href = ''
    const geometry = new PlaneBufferGeometry()
    const material = new MeshBasicMaterial()
    material.map = linkHelperTexture
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
    this.href = source.href
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      link: {
        href: this.href
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('link', {
      href: this.href
    })
    this.addGLTFComponent('networked', {
      id: this.uuid
    })
    this.replaceObject()
  }
}
