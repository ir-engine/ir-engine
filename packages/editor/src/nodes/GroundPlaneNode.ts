import { Mesh, CircleBufferGeometry, MeshBasicMaterial, Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import GroundPlane from '@xrengine/engine/src/scene/classes/GroundPlane'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from './SceneNode'
export default class GroundPlaneNode extends EditorNodeMixin(GroundPlane) {
  static legacyComponentName = 'ground-plane'
  static nodeName = 'Ground Plane'
  static canAddNode() {
    return (Engine.scene as any as SceneNode).findNodeByType(GroundPlaneNode) === null
  }
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { color } = json.components.find((c) => c.name === 'ground-plane').props
    node.color.set(color)
    const shadowComponent = json.components.find((c) => c.name === 'shadow')
    if (shadowComponent) {
      node.receiveShadow = shadowComponent.props.receive
    }
    node.walkable = !!json.components.find((c) => c.name === 'walkable')
    return node
  }
  constructor() {
    super()
    this.walkable = true
    this.walkableMesh = new Mesh(new CircleBufferGeometry(1, 32), new MeshBasicMaterial())
    this.walkableMesh.name = 'WalkableMesh'
    this.walkableMesh.scale.set(100, 100, 100)
    this.walkableMesh.position.y = -0.05
    this.walkableMesh.rotation.x = -Math.PI / 2
    this.walkableMesh.visible = false
    this.add(this.walkableMesh)
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.walkableMesh)
    }
    super.copy(source, recursive)
    if (recursive) {
      const walkableMeshIndex = source.children.findIndex((child) => child === source.walkableMesh)
      if (walkableMeshIndex !== -1) {
        this.walkableMesh = this.children[walkableMeshIndex]
      }
    }
    this.walkable = source.walkable
    return this
  }
  async serialize(projectID) {
    const components = {
      'ground-plane': {
        color: this.color
      },
      shadow: {
        receive: this.receiveShadow
      }
    }
    if (this.walkable) {
      ;(components as any).walkable = {}
    }
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    const groundPlaneCollider = new Object3D()

    groundPlaneCollider.scale.set(this.walkableMesh.scale.x, 0.1, this.walkableMesh.scale.z)
    this.add(groundPlaneCollider)
    this.remove(this.walkableMesh)
    this.addGLTFComponent('shadow', {
      receive: this.receiveShadow,
      cast: false
    })
  }
}
