import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import { InjectionPoint } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class RealityPackNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'realitypack'
  static nodeName = 'Reality Pack'
  static disableTransform = true
  static haveStaticTags = false

  packName: string
  injectionPoint: keyof typeof InjectionPoint

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { packName, injectionPoint } = json.components.find((c) => c.name === 'realitypack').props
    node.packName = packName
    node.injectionPoint = injectionPoint
    return node
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      realitypack: {
        packName: this.packName,
        injectionPoint: this.injectionPoint
      }
    })
  }
}
