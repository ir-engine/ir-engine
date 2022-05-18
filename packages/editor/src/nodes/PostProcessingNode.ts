import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { configureEffectComposer } from '@xrengine/engine/src/renderer/functions/configureEffectComposer'
import PostProcessing from '@xrengine/engine/src/scene/classes/PostProcessing'
import { SceneManager } from '../managers/SceneManager'
import EditorNodeMixin from './EditorNodeMixin'
import SceneNode from './SceneNode'

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class PostProcessingNode extends EditorNodeMixin(PostProcessing) {
  static nodeName = 'Post Processing'
  static legacyComponentName = 'postprocessing'
  static disableTransform = true
  static ignoreRaycast = true
  static haveStaticTags = false

  constructor() {
    super()
    this.postProcessingOptions = Object.assign({}, PostProcessing.defaultOptions)
  }

  static canAddNode() {
    return (Engine.scene as any as SceneNode).findNodeByType(PostProcessingNode) === null
  }

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const postProcessing = json.components.find((c) => c.name === 'postprocessing')
    const { options } = postProcessing.props
    node.postProcessingOptions = Object.assign({}, options ?? PostProcessing.defaultOptions)
    return node
  }

  async serialize(projectID) {
    let data: any = {}
    data = {
      options: this.postProcessingOptions
    }
    return await super.serialize(projectID, { postprocessing: data })
  }

  onChange() {
    configureEffectComposer(SceneManager.instance.postProcessingNode?.postProcessingOptions, !this.visible && false)
  }

  onRemove() {
    configureEffectComposer(null, true)
  }

  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('postprocessing', {
      options: this.postProcessingOptions
    })
    this.replaceObject()
  }
}
