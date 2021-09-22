import { Object3D, BoxBufferGeometry, Material, Mesh, BoxHelper } from 'three'
import EditorNodeMixin from './EditorNodeMixin'

/**
 * @todo add collisionLayer and collisionMask properties
 */

export default class BoxColliderNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'box-collider'
  static nodeName = 'Box Collider'
  static _geometry = new BoxBufferGeometry()
  static _material = new Material()

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const boxCollider = json.components.find((c) => c.name === 'box-collider')

    if (boxCollider) {
      node.isTrigger = boxCollider.props.isTrigger
    }

    return node
  }

  constructor() {
    super()
    const boxMesh = new Mesh(BoxColliderNode._geometry, BoxColliderNode._material)
    boxMesh.scale.multiplyScalar(2) // engine uses half-extents for box size, to be compatible with gltf and threejs
    const box = new BoxHelper(boxMesh, 0x00ff00)
    box.layers.set(1)
    this.helper = box
    this.add(box)
    this.isTrigger = false
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper)
    }
    super.copy(source, recursive)
    if (recursive) {
      const helperIndex = source.children.indexOf(source.helper)
      if (helperIndex !== -1) {
        const boxMesh = new Mesh(BoxColliderNode._geometry, BoxColliderNode._material)
        boxMesh.scale.multiplyScalar(2)
        const box = new BoxHelper(boxMesh, 0x00ff00) as any
        box.layers.set(1)
        this.helper = box
        box.parent = this
        this.children.splice(helperIndex, 1, box)
      }
    }
    this.isTrigger = source.isTrigger
    return this
  }
  async serialize(projectID) {
    const components = {
      'box-collider': {
        isTrigger: this.isTrigger
      }
    }
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('box-collider', {
      isTrigger: this.isTrigger
    })
  }
}
