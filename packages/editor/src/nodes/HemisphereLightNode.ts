import EditorNodeMixin from './EditorNodeMixin'
import PhysicalHemisphereLight from '@xrengine/engine/src/scene/classes/PhysicalHemisphereLight'
import SceneNode from './SceneNode'
import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
export default class HemisphereLightNode extends EditorNodeMixin(PhysicalHemisphereLight) {
  static legacyComponentName = 'hemisphere-light'
  static disableTransform = true
  static nodeName = 'Hemisphere Light'
  static canAddNode() {
    return (useEngine().scene as any as SceneNode).findNodeByType(HemisphereLightNode) === null
  }
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { skyColor, groundColor, intensity } = json.components.find((c) => c.name === 'hemisphere-light').props
    node.skyColor.set(skyColor)
    node.groundColor.set(groundColor)
    node.intensity = intensity
    return node
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      'hemisphere-light': {
        skyColor: this.skyColor,
        groundColor: this.groundColor,
        intensity: this.intensity
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('hemisphere-light', {
      skyColor: this.skyColor,
      groundColor: this.groundColor,
      intensity: this.intensity
    })
    this.replaceObject()
  }
}
