import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class CustomScriptNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'customscript'
  static nodeName = 'Custom Script'
  scriptID = ''
  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const { scriptID } = json.components.find((c) => c.name === 'customscript').props
    node.scriptID = scriptID
    return node
  }
  constructor(editor) {
    super(editor)
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      customscript: {
        scriptID: this.scriptID
      }
    })
  }
}
