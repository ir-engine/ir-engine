import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class CustomScriptNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'customscript'
  static nodeName = 'Custom Script'
  static disableTransform = true
  static haveStaticTags = false

  scriptID = ''
  scriptSelected = 0

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const { scriptID, scriptSelected } = json.components.find((c) => c.name === 'customscript').props
    node.scriptID = scriptID
    node.scriptSelected = scriptSelected
    return node
  }
  constructor(editor) {
    super(editor)
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      customscript: {
        scriptID: this.scriptID,
        scriptSelected: this.scriptSelected
      }
    })
  }
}
