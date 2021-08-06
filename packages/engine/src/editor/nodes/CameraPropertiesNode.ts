



import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
export default class CameraPropertiesNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'cameraproperties'
  static nodeName = 'Camera Properties'

  static async deserialize(editor, json) {
    console.log('Deserializing The GameNode')
    const node = await super.deserialize(editor, json)
    const { name, fov, cameraNearClip, cameraFarClip, projectionType, shoulderCameraDistance, thirdPersonCameraDistance, cameraMode, cameraModeDefault } = json.components.find(
      (c) => c.name === CameraPropertiesNode.legacyComponentName
    ).props
    node.name = name
    node.fov = fov ?? 50
    node.cameraNearClip = cameraNearClip ?? .1
    node.cameraFarClip = cameraFarClip ?? 100
    node.projectionType = projectionType
    node.thirdPersonCameraDistance = thirdPersonCameraDistance ?? 20
    node.shoulderCameraDistance = shoulderCameraDistance ?? 6

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
        thirdPersonCameraDistance: this.thirdPersonCameraDistance,
        shoulderCameraDistance: this.shoulderCameraDistance,
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
