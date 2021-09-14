import { getUrlFromId } from '@xrengine/engine/src'
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

  _scriptUrl: string
  static initialElementProps = {
    src: ''
  }

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const { scriptUrl } = json.components.find((c) => c.name === 'customscript').props
    node.scriptUrl = scriptUrl
    return node
  }
  constructor(editor) {
    super(editor)
  }

  set src(val) {
    this.scriptUrl = val
  }

  set scriptUrl(val) {
    this._scriptUrl = val
    this.editor.emit('selectionChanged')
  }

  get scriptUrl() {
    return this._scriptUrl
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      customscript: {
        scriptUrl: this.scriptUrl
      }
    })
  }
}
