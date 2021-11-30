import { CameraHelper, Matrix4, PerspectiveCamera } from 'three'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import EditorNodeMixin from './EditorNodeMixin'
import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from './SceneNode'

export default class ScenePreviewCameraNode extends EditorNodeMixin(PerspectiveCamera) {
  static legacyComponentName = 'scene-preview-camera'
  static nodeName = 'Scene Preview Camera'
  static canAddNode() {
    return (useEngine().scene as any as SceneNode).findNodeByType(ScenePreviewCameraNode) === null
  }
  constructor() {
    super(80, 16 / 9, 0.2, 8000)
    const cameraHelper = new CameraHelper(this as any)
    cameraHelper.layers.set(1)
    this.helper = cameraHelper
  }
  setFromViewport() {
    const matrix = new Matrix4().copy(this.parent.matrixWorld).invert().multiply(useEngine().camera.matrixWorld)
    matrix.decompose(this.position, this.rotation, this.scale)
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
  }
  onSelect() {
    useEngine().scene.add(this.helper)
    this.helper.update()
  }
  onDeselect() {
    useEngine().scene.remove(this.helper)
  }
  async serialize(projectID) {
    return await super.serialize(projectID, { 'scene-preview-camera': {} })
  }
  prepareForExport() {
    super.prepareForExport()
    // This name is required in the current Hubs client.
    // It's possible to migrate to the scene-preview-camera component in the future.
    this.name = 'scene-preview-camera'
    this.addGLTFComponent('scene-preview-camera')
    this.replaceObject()
  }
}
