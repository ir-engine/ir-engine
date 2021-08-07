import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
export default class CameraPropertiesNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'cameraproperties'
  static nodeName = 'Camera Properties'

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const {
      name,
      fov,
      cameraNearClip,
      cameraFarClip,
      projectionType,
      maxCameraDistance,
      startCameraDistance,
      minCameraDistance,
      cameraMode,
      cameraModeDefault
    } = json.components.find((c) => c.name === CameraPropertiesNode.legacyComponentName).props
    node.name = name
    node.fov = fov ?? 50
    node.cameraNearClip = cameraNearClip ?? 0.1
    node.cameraFarClip = cameraFarClip ?? 100
    node.projectionType = projectionType
    node.minCameraDistance = minCameraDistance ?? 20
    node.maxCameraDistance = maxCameraDistance ?? 6
    node.startCameraDistance = startCameraDistance ?? 12

    node.cameraMode = cameraMode
    node.cameraModeDefault = cameraModeDefault
    return node
  }
  constructor(editor) {
    super(editor)
  }
  copy(source) {
    super.copy(source)
    return this
  }
  async serialize(projectID) {
    const components = {
      cameraproperties: {
        name: this.name,
        fov: this.fov,
        cameraNearClip: this.cameraNearClip,
        cameraFarClip: this.cameraFarClip,
        projectionType: this.projectionType,
        minCameraDistance: this.minCameraDistance,
        maxCameraDistance: this.maxCameraDistance,
        startCameraDistance: this.startCameraDistance,
        cameraMode: this.cameraMode,
        cameraModeDefault: this.cameraModeDefault
      }
    } as any
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
  }
}
