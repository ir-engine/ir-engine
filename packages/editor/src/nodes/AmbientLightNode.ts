import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import { AmbientLight } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import SceneNode from './SceneNode'
export default class AmbientLightNode extends EditorNodeMixin(AmbientLight) {
  static legacyComponentName = 'ambient-light'
  static nodeName = 'Ambient Light'
  static disableTransform = true
  static canAddNode() {
    return (useEngine().scene as any as SceneNode).findNodeByType(AmbientLightNode) === null
  }
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { color, intensity } = json.components.find((c) => c.name === 'ambient-light').props
    node.color.set(color)
    node.intensity = intensity
    return node
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      'ambient-light': {
        color: this.color,
        intensity: this.intensity
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('ambient-light', {
      color: this.color,
      intensity: this.intensity
    })
    this.replaceObject()
  }
}
