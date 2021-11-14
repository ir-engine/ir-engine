import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'

/**
 * @author Hanzla Mateen <hanzlamateen@live.com>
 */
export default class ScriptNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'script'
  static nodeName = 'Script'
  static disableTransform = true
  static haveStaticTags = false

  isValidURL = false
  scriptPath: string

  constructor() {
    super()
    this.validatePath(this.scriptPath)
  }

  checkUrl(url) {
    var xhr = new XMLHttpRequest()
    xhr.open('HEAD', url, false)
    xhr.send()

    return xhr.status !== 404
  }

  validatePath(scriptPath) {
    if (scriptPath) {
      this.isValidURL = this.checkUrl(scriptPath)
    }
  }

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const script = json.components.find((c) => c.name === 'script')
    if (script) {
      const { scriptPath } = script.props
      node.scriptPath = scriptPath
      node.validatePath(scriptPath)
    }
    return node
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      script: {
        scriptPath: this.scriptPath
      }
    })
  }
}
