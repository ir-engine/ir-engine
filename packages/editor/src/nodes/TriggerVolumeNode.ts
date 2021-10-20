import { Material, BoxBufferGeometry, Object3D, Mesh, BoxHelper, Vector3 } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
const requiredProperties = ['target', 'onEnter', 'onExit', 'showHelper']
export default class TriggerVolumeNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'trigger-volume'
  static nodeName = 'Trigger Volume'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const props = json.components.find((c) => c.name === 'trigger-volume').props
    node.target = props.target
    node.onEnter = props.onEnter
    node.onExit = props.onExit
    node.showHelper = props.showHelper
    return node
  }
  constructor() {
    super()
    const boxMesh = new Mesh(TriggerVolumeNode._geometry, TriggerVolumeNode._material)
    boxMesh.scale.multiplyScalar(2) // engine uses half-extents for box size, to be compatible with gltf and threejs
    const box = new BoxHelper(boxMesh, 0xffff00)
    box.layers.set(1)
    this.helper = box
    this.add(box)
    this.target = null
    this.onEnter = ''
    this.onExit = ''
    this.showHelper = false
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper)
    }
    super.copy(source, recursive)
    if (recursive) {
      const helperIndex = source.children.indexOf(source.helper)
      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex]
      }
    }
    this.target = source.target
    this.onEnter = source.onEnter
    this.onExit = source.onExit
    this.showHelper = source.showHelper
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      'trigger-volume': {
        target: this.target,
        onEnter: this.onEnter,
        onExit: this.onExit,
        showHelper: this.showHelper
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    for (const prop of requiredProperties) {
      if (this[prop] === null || this[prop] === undefined) {
        console.warn(`TriggerVolumeNode: property "${prop}" is required. Skipping...`)
        return
      }
    }
    const scale = new Vector3()
    this.getWorldScale(scale)
    this.addGLTFComponent('trigger-volume', {
      size: { x: scale.x, y: scale.y, z: scale.z },
      target: this.gltfIndexForUUID(this.target),
      onEnter: this.onEnter,
      onExit: this.onExit,
      showHelper: this.showHelper
    })
  }
}
