import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
export default class SystemNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'system'
  static nodeName = 'System'
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { name } = json.components.find((c) => c.name === 'system').props
    node.name = name
    return node
  }
  copy(source, recursive = true) {
    super.copy(source, recursive)
    return this
  }
  async serialize(projectID) {
    const components = {
      system: {
        name: this.name
      }
    }
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('system', {
      name: this.name
    })
  }
}
