import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class RealityPackNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'realitypack'
  static nodeName = 'Reality Pack'
  static disableTransform = true
  static haveStaticTags = false

  packIndex: number = 0
  packName: string
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { packIndex, packName } = json.components.find((c) => c.name === 'realitypack').props
    node.packIndex = packIndex
    node.packName = packName
    return node
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      realitypack: {
        packIndex: this.packIndex,
        packName: this.packName
      }
    })
  }
}
